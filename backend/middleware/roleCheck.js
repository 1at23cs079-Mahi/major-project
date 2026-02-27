const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role.name;

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    };
};

module.exports = roleCheck;
