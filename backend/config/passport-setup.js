import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
// import FacebookStrategy from 'passport-facebook';
import ExchangeRate from '../models/ExchangeRate.js';
import User from '../models/userModel.js';

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Estrategia de Google
passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const googleEmail = profile.emails[0].value;

      try {
        // 1. Buscar si ya existe un usuario con este googleId
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          // Si ya existe, perfecto, continuamos.
          return done(null, user);
        }

        // 2. Si no, buscar si existe un usuario con ese mismo email (que se registró manualmente)
        user = await User.findOne({ email: googleEmail });
        if (user) {
          // Si existe, vinculamos la cuenta añadiendo el googleId
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // 3. Si no existe de ninguna de las dos formas, creamos un nuevo usuario
        const newUser = await new User({
          googleId: profile.id,
          fullName: profile.displayName,
          email: googleEmail,
          // No se establece contraseña, el modelo debe permitirlo
        }).save();

        // ¡IMPORTANTE! Al igual que en el registro manual, creamos su configuración de tasas.
        await ExchangeRate.create({
          user: newUser._id,
          conversions: [
            { fromCurrency: 'USD', toCurrency: 'VES', rate: 40.0, lastUpdated: new Date() },
            { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.1, lastUpdated: new Date() },
          ],
          defaultProfitPercentage: 20,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Estrategia de Facebook (similar a la de Google)
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: '/api/auth/facebook/callback',
//       profileFields: ['id', 'displayName', 'emails'],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       // Lógica similar a la de Google para encontrar o crear usuario
//       // ...
//     }
//   )
// );