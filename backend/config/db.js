// C:\Proyectos\Label\backend\config\db.js
import mongoose from 'mongoose';
import 'dotenv/config'; // Para cargar las variables de entorno

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // Eliminated deprecated options
    console.log(`MongoDB Conectada: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
