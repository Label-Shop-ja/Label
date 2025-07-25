// C:\Proyectos\Label\backend\globalProductCleanupJob.js
// Este script está diseñado para ser ejecutado como un Cron Job,
// independientemente del servidor principal de la aplicación.
import 'dotenv/config'; // Cargar variables de entorno
import 'colors'; // Para que los colores en la consola funcionen con 'import'

import mongoose from 'mongoose';
import GlobalProduct from './models/GlobalProduct.js';
import Product from './models/productModel.js'; // Corregimos la ruta al modelo de producto

// Función para conectar a la base de datos específicamente para este script
const connectDBForCleanup = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB conectada para limpieza: ${conn.connection.host}`.cyan.underline); // colors se añade al prototipo de String
    } catch (error) {
        console.error(`Error de conexión a MongoDB para limpieza: ${error.message}`.red.bold);
        process.exit(1); // Salir con error si la conexión falla
    }
};

// @desc    Función para limpiar productos globales inactivos
// @access  Solo para uso interno (programado, no expuesto vía API)
const cleanInactiveGlobalProducts = async () => {
    console.log('--- Iniciando tarea de limpieza de productos globales inactivos ---');

    try {
        // Calcular la fecha límite (ej. 30 días atrás)
        const purgeThresholdDays = 30; // Puedes ajustar este valor
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - purgeThresholdDays);
        console.log(`Fecha límite para inactividad: ${thresholdDate.toISOString()}`);

        // 1. Encontrar todos los GlobalProducts que no han sido usados en los últimos 'purgeThresholdDays'
        const inactiveGlobalProducts = await GlobalProduct.find({
            lastUsedAt: { $lt: thresholdDate } // lastUsedAt es menor que (anterior a) thresholdDate
        });

        if (inactiveGlobalProducts.length === 0) {
            console.log('No se encontraron productos globales inactivos para limpiar.');
            console.log('--- Fin tarea de limpieza ---');
            return { message: 'No se encontraron productos globales inactivos.', count: 0 };
        }

        console.log(`Se encontraron ${inactiveGlobalProducts.length} productos globales potencialmente inactivos.`);

        let deletedCount = 0;
        let skippedCount = 0;

        // 2. Para cada producto inactivo, verificar si tiene referencias activas en la colección 'Product'
        for (const globalProduct of inactiveGlobalProducts) {
            // Verificar si algún producto de usuario todavía referencia este GlobalProduct por su SKU
            // Usamos .countDocuments() para ser más eficiente que .exists() si es posible,
            // aunque .exists() es más directo para una simple comprobación de existencia.
            const activeUserProductCount = await Product.countDocuments({ sku: globalProduct.sku });

            if (activeUserProductCount > 0) {
                // Si todavía hay productos de usuario que lo referencian, NO lo eliminamos.
                // Aquí, también podemos actualizar su lastUsedAt a la fecha actual para "re-activarlo".
                await GlobalProduct.findByIdAndUpdate(
                    globalProduct._id,
                    { lastUsedAt: Date.now() },
                    { new: true } // Opcional: para obtener el documento actualizado
                );
                skippedCount++;
                console.log(`Saltando GlobalProduct (SKU: ${globalProduct.sku}) - Aún referenciado. lastUsedAt re-actualizado.`);
            } else {
                // Si no hay productos de usuario que lo referencien, es seguro eliminarlo
                await GlobalProduct.deleteOne({ _id: globalProduct._id });
                deletedCount++;
                console.log(`Eliminado GlobalProduct (SKU: ${globalProduct.sku}) - No referenciado y es inactivo.`);
            }
        }

        console.log(`Resumen de limpieza:`);
        console.log(`  Productos globales eliminados: ${deletedCount}`);
        console.log(`  Productos globales saltados (aún referenciados): ${skippedCount}`);
        console.log('--- Fin tarea de limpieza ---');
        return { message: 'Limpieza de productos globales completada.', deletedCount, skippedCount };

    } catch (error) {
        console.error('Error durante la limpieza de productos globales inactivos:', error);
        return { message: 'Error durante la limpieza de productos globales.', error: error.message };
    } finally {
        // Asegúrate de cerrar la conexión a la base de datos después de la limpieza
        mongoose.connection.close()
            .then(() => console.log('Conexión a MongoDB cerrada para limpieza.'.magenta.underline))
            .catch(err => console.error('Error al cerrar conexión MongoDB para limpieza:', err.message));
    }
};

// Ejecutar la tarea de limpieza cuando el script es llamado
(async () => {
    await connectDBForCleanup(); // Conectar a la DB
    await cleanInactiveGlobalProducts(); // Ejecutar la limpieza
})();
