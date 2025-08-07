import mongoose from 'mongoose';

const productChangeLogSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        changeType: {
            type: String,
            required: true,
            enum: ['UPDATE', 'STOCK_ADJUSTMENT', 'PRICE_CHANGE', 'VARIANT_CHANGE', 'OTHER'],
            default: 'UPDATE',
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        changes: [{
            field: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
        }],
        metadata: {
            userAgent: String,
            ipAddress: String,
        },
    },
    {
        timestamps: true,
    }
);

productChangeLogSchema.index({ product: 1, createdAt: -1 });
productChangeLogSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('ProductChangeLog', productChangeLogSchema);