"""
Redis cache service for performance optimization
"""
import redis
import json
import logging
import asyncio
from typing import Any, Optional, Callable
from functools import wraps
from datetime import timedelta

from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisCache:
    """Redis cache manager"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.enabled = False
    
    def connect(self):
        """Connect to Redis server"""
        try:
            redis_url = getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
            self.enabled = True
            logger.info("Redis cache connected successfully")
        except Exception as e:
            logger.warning(f"Redis cache not available: {e}. Continuing without cache.")
            self.enabled = False
    
    def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            self.redis_client.close()
            logger.info("Redis cache disconnected")
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None
        """
        if not self.enabled:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                logger.debug(f"Cache hit: {key}")
                return json.loads(value)
            logger.debug(f"Cache miss: {key}")
            return None
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None
    
    def set(
        self,
        key: str,
        value: Any,
        ttl: int = 300  # 5 minutes default
    ) -> bool:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            
        Returns:
            True if successful
        """
        if not self.enabled:
            return False
        
        try:
            serialized = json.dumps(value, default=str)
            self.redis_client.setex(key, ttl, serialized)
            logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """
        Delete key from cache
        
        Args:
            key: Cache key
            
        Returns:
            True if deleted
        """
        if not self.enabled:
            return False
        
        try:
            self.redis_client.delete(key)
            logger.debug(f"Cache deleted: {key}")
            return True
        except Exception as e:
            logger.error(f"Redis delete error: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching pattern
        
        Args:
            pattern: Key pattern (e.g., "user:*")
            
        Returns:
            Number of keys deleted
        """
        if not self.enabled:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                count = self.redis_client.delete(*keys)
                logger.debug(f"Cache deleted pattern {pattern}: {count} keys")
                return count
            return 0
        except Exception as e:
            logger.error(f"Redis delete pattern error: {e}")
            return 0
    
    def clear_all(self) -> bool:
        """Clear all cache"""
        if not self.enabled:
            return False
        
        try:
            self.redis_client.flushdb()
            logger.info("Cache cleared")
            return True
        except Exception as e:
            logger.error(f"Redis clear error: {e}")
            return False


# Global cache instance
cache = RedisCache()


def cached(
    ttl: int = 300,
    key_prefix: str = "",
    key_builder: Optional[Callable] = None
):
    """
    Decorator for caching function results
    
    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key
        key_builder: Custom function to build cache key
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                # Default: use function name and arguments
                arg_str = "_".join(str(arg) for arg in args if arg)
                kwarg_str = "_".join(f"{k}={v}" for k, v in kwargs.items())
                cache_key = f"{key_prefix}{func.__name__}:{arg_str}:{kwarg_str}"
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
            
            # Store in cache
            cache.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


# Cache key builders
def device_cache_key(user_id: str) -> str:
    """Build cache key for user devices"""
    return f"devices:user:{user_id}"


def access_history_cache_key(user_id: str, limit: int = 100) -> str:
    """Build cache key for access history"""
    return f"access:user:{user_id}:limit:{limit}"


def user_cache_key(user_id: str) -> str:
    """Build cache key for user"""
    return f"user:{user_id}"
