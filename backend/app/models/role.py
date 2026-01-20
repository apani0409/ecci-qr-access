"""
Enum for user roles in the system
"""
import enum


class UserRole(str, enum.Enum):
    """User role enumeration"""
    STUDENT = "student"      # Regular student user
    SECURITY = "security"    # Security guard - can view all access records
    ADMIN = "admin"          # Administrator - full system access
    
    def __str__(self):
        return self.value
    
    @property
    def permissions(self):
        """Get permissions for this role"""
        role_permissions = {
            UserRole.STUDENT: [
                "read:own_devices",
                "write:own_devices",
                "read:own_access",
            ],
            UserRole.SECURITY: [
                "read:own_devices",
                "write:own_devices",
                "read:own_access",
                "read:all_access",      # Can view all access records
                "scan:qr_codes",         # Can scan QR codes
            ],
            UserRole.ADMIN: [
                "read:*",
                "write:*",
                "delete:*",
                "manage:users",
                "manage:webhooks",
            ],
        }
        return role_permissions.get(self, [])
