import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixSkuIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado a MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('products');

        // Obtener índices existentes
        const indexes = await collection.indexes();
        console.log('Índices existentes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

        // Eliminar el índice único de SKU si existe
        try {
            await collection.dropIndex('sku_1');
            console.log('Índice sku_1 eliminado exitosamente');
        } catch (error) {
            console.log('El índice sku_1 no existe o ya fue eliminado');
        }

        // Crear el nuevo índice compuesto único (user + sku)
        await collection.createIndex({ user: 1, sku: 1 }, { unique: true });
        console.log('Nuevo índice compuesto (user + sku) creado exitosamente');

        // Verificar los nuevos índices
        const newIndexes = await collection.indexes();
        console.log('Nuevos índices:', newIndexes.map(idx => ({ name: idx.name, key: idx.key })));

        console.log('Migración completada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('Error en la migración:', error);
        process.exit(1);
    }
};

fixSkuIndex();