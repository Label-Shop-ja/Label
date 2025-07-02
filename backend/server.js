import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import 'colors'; // Para que los colores en la consola funcionen

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(
    `Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`
      .yellow.bold
  )
);