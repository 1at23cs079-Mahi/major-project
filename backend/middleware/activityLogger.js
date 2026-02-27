const { ActivityLog } = require('../models');

const activityLogger = (action, resource = null) => {
    return async (req, res, next) => {
        try {
            // Create activity log
            await ActivityLog.create({
                user_id: req.user ? req.user.id : null,
                action: action,
                resource: resource || req.baseUrl,
                resource_id: req.params.id || null,
                details: {
                    method: req.method,
                    path: req.path,
                    body: req.method !== 'GET' ? req.body : undefined
                },
                ip_address: req.ip || req.connection.remoteAddress,
                user_agent: req.get('user-agent')
            });

            next();
        } catch (error) {
            // Don't fail the request if logging fails
            console.error('Activity logging error:', error.message);
            next();
        }
    };
};

module.exports = activityLogger;
