"""
Authorization decorators and utilities for role-based access control
"""
from functools import wraps
from typing import List, Optional
from fastapi import Depends, HTTPException, status

from app.models.role import UserRole
from app.models.user import User
from app.utils.dependencies import get_current_user


class RoleChecker:
    """Dependency for checking user roles"""
    
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """
        Check if current user has one of the allowed roles
        
        Args:
            current_user: Currently authenticated user
            
        Returns:
            User if authorized
            
        Raises:
            HTTPException: If user doesn't have required role
        """
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in self.allowed_roles]}"
            )
        return current_user


class PermissionChecker:
    """Dependency for checking specific permissions"""
    
    def __init__(self, required_permission: str):
        self.required_permission = required_permission
    
    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """
        Check if current user has the required permission
        
        Args:
            current_user: Currently authenticated user
            
        Returns:
            User if authorized
            
        Raises:
            HTTPException: If user doesn't have required permission
        """
        # Admin has all permissions
        if current_user.role == UserRole.ADMIN:
            return current_user
        
        # Check if permission matches wildcard (e.g., "read:*")
        user_permissions = current_user.role.permissions
        
        # Check exact match
        if self.required_permission in user_permissions:
            return current_user
        
        # Check wildcard permissions
        permission_category = self.required_permission.split(":")[0]
        if f"{permission_category}:*" in user_permissions:
            return current_user
        
        if "*" in user_permissions or "read:*" in user_permissions:
            return current_user
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required permission: {self.required_permission}"
        )


# Pre-defined role checkers for common use cases
require_admin = RoleChecker([UserRole.ADMIN])
require_security_or_admin = RoleChecker([UserRole.SECURITY, UserRole.ADMIN])
require_any_role = RoleChecker([UserRole.STUDENT, UserRole.SECURITY, UserRole.ADMIN])


def has_permission(user: User, permission: str) -> bool:
    """
    Check if user has a specific permission
    
    Args:
        user: User to check
        permission: Permission string (e.g., "read:devices")
        
    Returns:
        True if user has permission, False otherwise
    """
    if user.role == UserRole.ADMIN:
        return True
    
    user_permissions = user.role.permissions
    
    # Check exact match
    if permission in user_permissions:
        return True
    
    # Check wildcard
    permission_category = permission.split(":")[0]
    if f"{permission_category}:*" in user_permissions:
        return True
    
    if "*" in user_permissions:
        return True
    
    return False


def is_admin(user: User) -> bool:
    """Check if user is admin"""
    return user.role == UserRole.ADMIN


def is_security(user: User) -> bool:
    """Check if user is security guard"""
    return user.role == UserRole.SECURITY


def can_view_all_access(user: User) -> bool:
    """Check if user can view all access records"""
    return user.role in [UserRole.SECURITY, UserRole.ADMIN]
