// C:\Proyectos\Label\backend\config\db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Para cargar las variables de entorno

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Desaconsejado en versiones recientes de Mongoose, pero no causa error
      useUnifiedTopology: true, // Desaconsejado en versiones recientes de Mongoose, pero no causa error
      // useCreateIndex: true, // Ya no es soportado en Mongoose 6+
      // useFindAndModify: false // Ya no es soportado en Mongoose 6+
    });
    console.log(`MongoDB Conectada: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Salir del proceso con fallo
  }
};

module.exports = connectDB;