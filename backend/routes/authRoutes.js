import express from 'express';
import passport from 'passport';
import {
  getAuthStatus,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  verifyResetCode,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
// Esta ruta ahora debe estar protegida para que solo se pueda acceder con el token temporal
router.post('/reset-password', protect, resetPassword);

// --- Rutas de Autenticación Social ---

// Ruta para iniciar la autenticación con Google
router.get('/google', (req, res, next) => {
  const options = { scope: ['profile', 'email'] };
  
  // Si se pasa prompt=select_account, forzar selección de cuenta
  if (req.query.prompt === 'select_account') {
    options.prompt = 'select_account';
  }
  
  passport.authenticate('google', options)(req, res, next);
});

// Ruta de callback de Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/?login_error=google_failed` }), // Redirige al frontend en caso de fallo
  (req, res) => {
    // Si tiene éxito, el usuario está en req.user gracias a Passport.
    // Simplemente redirigimos a una página de callback en el frontend.
    // El frontend se encargará de pedir los tokens.
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
  }
);

// NUEVA RUTA: El frontend llamará a esta ruta para obtener el estado de la autenticación
// y los tokens después de la redirección de OAuth.
router.get('/status', getAuthStatus);

// Rutas para Facebook (análogas a las de Google)
// router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login-failed' }), (req, res) => {
//     res.redirect(process.env.FRONTEND_URL + '/dashboard');
// });
router.post('/refresh', refreshAccessToken);

export default router;