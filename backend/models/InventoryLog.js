// C:\Proyectos\Label\backend\models\InventoryLog.js
import mongoose from 'mongoose';

const inventoryLogSchema = mongoose.Schema(
    {
        user: { // El usuario que realizó el movimiento
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        product: { // El producto principal afectado
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        variant: { // La variante específica afectada (si aplica)
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Opcional, solo si el movimiento es de una variante
            ref: 'Product.variants', // Referencia a una sub-colección (manejo especial en populate)
        },
        productName: { // Nombre del producto al momento del log (para referencia rápida)
            type: String,
            required: true,
        },
        variantName: { // Nombre de la variante al momento del log (para referencia rápida)
            type: String,
            required: false,
        },
        sku: { // SKU del producto o variante (para referencia rápida)
            type: String,
            required: false,
        },
        movementType: { // Tipo de movimiento: 'in' (entrada), 'out' (salida), 'adjustment' (ajuste)
            type: String,
            required: true,
            enum: ['in', 'out', 'adjustment'],
        },
        quantityChange: { // Cantidad que cambió el stock (siempre positivo)
            type: Number,
            required: true,
            min: 0, // La cantidad del cambio es siempre positiva
        },
        finalStock: { // Stock resultante después del movimiento
            type: Number,
            required: true,
            min: 0,
        },
        reason: { // Razón del movimiento: 'sale', 'purchase', 'return', 'damage', 'loss', 'initial_stock', 'correction', etc.
            type: String,
            required: true,
            trim: true,
        },
        relatedSale: { // ID de la venta si el movimiento fue por una venta
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sale',
            required: false,
        },
        // Puedes añadir más campos como:
        // relatedPurchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: false },
        // location: { type: String, trim: true }, // Si implementamos control por ubicación
    },
    {
        timestamps: true, // Añade `createdAt` y `updatedAt` automáticamente
    }
);

export default mongoose.model('InventoryLog', inventoryLogSchema);