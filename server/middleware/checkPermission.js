const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            // req.workspaceRole is set by authWorkspace middleware
            const role = req.workspaceRole;

            if (!role) {
                return res.status(403).json({ message: 'Access denied. Generic permissions check failed.' });
            }

            // Owner usually has all permissions (convention: '*')
            if (role.permissions.includes('*')) {
                return next();
            }

            if (!role.permissions.includes(requiredPermission)) {
                return res.status(403).json({
                    message: `Access denied. Requires permission: ${requiredPermission}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission Check Error:', error);
            res.status(500).json({ message: 'Server error checking permissions' });
        }
    };
};

module.exports = checkPermission;
