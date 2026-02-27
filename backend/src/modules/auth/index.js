/**
 * Auth Module Entry Point
 * Exports all auth module components
 */

const AuthService = require('./services/AuthService');
const TokenService = require('./services/TokenService');
const PasswordService = require('./services/PasswordService');
const UserRepository = require('./repositories/UserRepository');
const createAuthController = require('./controllers/AuthController');
const createAuthRouter = require('./routes');
const authMiddleware = require('./middleware/authMiddleware');

/**
 * Initialize auth module with models
 * @param {Object} models - Sequelize models
 * @returns {Object} Module components
 */
function initAuthModule(models) {
  // Create service with injected models
  const authService = new AuthService(models);
  
  // Create repository
  const userRepository = new UserRepository(models.User);
  
  // Create controller with injected service
  const authController = createAuthController(authService);
  
  // Create router with injected controller
  const authRouter = createAuthRouter(authController, userRepository);

  return {
    authService,
    userRepository,
    authController,
    authRouter,
    middleware: authMiddleware,
    TokenService,
    PasswordService,
  };
}

module.exports = {
  initAuthModule,
  AuthService,
  TokenService,
  PasswordService,
  UserRepository,
  authMiddleware,
};
