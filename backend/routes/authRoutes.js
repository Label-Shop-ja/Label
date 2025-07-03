import express from 'express';
import passport from 'passport';
import {
  getAuthStatus,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// --- Rutas de Autenticación Social ---

// Ruta para iniciar la autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

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