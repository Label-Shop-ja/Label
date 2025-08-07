import ProductChangeLog from '../models/productChangeLogModel.js';

export const logProductChange = async (userId, productId, changeData, changes = [], metadata = {}) => {
    try {
        const changeLog = new ProductChangeLog({
            user: userId,
            product: productId,
            changeType: changeData.changeType || 'UPDATE',
            reason: changeData.reason,
            changes,
            metadata,
        });

        await changeLog.save();
        return changeLog;
    } catch (error) {
        console.error('Error logging product change:', error);
        throw error;
    }
};

export const getProductChangeLogs = async (productId, limit = 10) => {
    try {
        const logs = await ProductChangeLog.find({ product: productId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit);
        
        return logs;
    } catch (error) {
        console.error('Error fetching product change logs:', error);
        throw error;
    }
};

export const compareProductChanges = (oldProduct, newProduct) => {
    const changes = [];
    const fieldsToCompare = [
        'name', 'description', 'category', 'price', 'stock', 'costPrice',
        'sku', 'brand', 'supplier', 'isPerishable', 'reorderThreshold'
    ];

    fieldsToCompare.forEach(field => {
        if (oldProduct[field] !== newProduct[field]) {
            changes.push({
                field,
                oldValue: oldProduct[field],
                newValue: newProduct[field],
            });
        }
    });

    // Compare variants if they exist
    if (oldProduct.variants && newProduct.variants) {
        if (oldProduct.variants.length !== newProduct.variants.length) {
            changes.push({
                field: 'variants_count',
                oldValue: oldProduct.variants.length,
                newValue: newProduct.variants.length,
            });
        }
    }

    return changes;
};