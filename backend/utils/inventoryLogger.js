// C:\Proyectos\Label\backend\utils\inventoryLogger.js
import InventoryLog from '../models/InventoryLog.js'; // Importamos el nuevo modelo

const logInventoryMovement = async ({
    user,
    product,
    variantId, // Para variantes
    productName,
    variantName, // Para variantes
    sku,
    movementType,
    quantityChange,
    finalStock,
    reason,
    relatedSale,
    session // Pasamos la sesión de transacción si aplica
}) => {
    try {
        const logData = {
            user,
            product,
            productName,
            sku,
            movementType,
            quantityChange,
            finalStock,
            reason,
        };

        if (variantId) {
            logData.variant = variantId;
            logData.variantName = variantName;
        }
        if (relatedSale) {
            logData.relatedSale = relatedSale;
        }

        // Si se pasa una sesión, creamos el log dentro de esa transacción
        const logOptions = session ? { session } : {};
        await InventoryLog.create([logData], logOptions); // Usamos array para ser compatible con transacciones

        // console.log(`Movimiento de inventario registrado: ${reason} de ${quantityChange} unidades de ${productName || sku}`);
    } catch (error) {
        // En un entorno de producción, aquí usaríamos un logger más robusto como Winston
        // para registrar el error sin detener la operación principal.
        console.error('Error al registrar el log de inventario:', error);
        // NOTA: No lanzamos el error de nuevo aquí para no abortar la transacción principal
        // si el logging es secundario a la operación de venta/ajuste de stock.
    }
};

export default logInventoryMovement;