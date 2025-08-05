// Script para limpiar el cache de tasas de cambio
import mongoose from 'mongoose';
import ExchangeRate from '../models/ExchangeRate.js';
import dotenv from 'dotenv';

dotenv.config();

const clearExchangeRateCache = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Limpiar todas las tasas de cambio cacheadas
        const result = await ExchangeRate.deleteMany({});
        
        console.log(`🗑️  Cache de tasas de cambio limpiado exitosamente`);
        console.log(`📊 Documentos eliminados: ${result.deletedCount}`);
        
        // Cerrar conexión
        await mongoose.connection.close();
        console.log('✅ Conexión cerrada');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al limpiar cache:', error);
        process.exit(1);
    }
};

clearExchangeRateCache();