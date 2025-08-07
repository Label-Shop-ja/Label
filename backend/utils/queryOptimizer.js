/**
 * Utilidades para optimización de queries MongoDB
 */

/**
 * Pipeline de agregación optimizado para productos
 */
export const getOptimizedProductsPipeline = (userId, filters = {}) => {
  const pipeline = [
    { $match: { user: userId } }
  ];

  // Filtros opcionales
  if (filters.category) {
    pipeline[0].$match.category = filters.category;
  }
  
  if (filters.lowStock) {
    pipeline[0].$match.stock = { $lte: filters.reorderLevel || 10 };
  }

  if (filters.search) {
    pipeline[0].$match.$text = { $search: filters.search };
  }

  // Proyección para campos necesarios
  pipeline.push({
    $project: {
      name: 1,
      sku: 1,
      price: 1,
      stock: 1,
      category: 1,
      image: 1,
      updatedAt: 1
    }
  });

  // Ordenamiento optimizado
  pipeline.push({ $sort: { updatedAt: -1 } });

  // Paginación
  if (filters.page && filters.limit) {
    const skip = (filters.page - 1) * filters.limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: filters.limit });
  }

  return pipeline;
};

/**
 * Pipeline optimizado para estadísticas de ventas
 */
export const getSalesStatsPipeline = (userId, dateRange = {}) => {
  const matchStage = { user: userId };
  
  if (dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  return [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$total' },
        totalTransactions: { $sum: 1 },
        avgSale: { $avg: '$total' },
        topProducts: {
          $push: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                productId: '$$item.product',
                quantity: '$$item.quantity',
                revenue: { $multiply: ['$$item.price', '$$item.quantity'] }
              }
            }
          }
        }
      }
    },
    {
      $project: {
        totalSales: { $round: ['$totalSales', 2] },
        totalTransactions: 1,
        avgSale: { $round: ['$avgSale', 2] },
        topProducts: { $slice: ['$topProducts', 10] }
      }
    }
  ];
};

/**
 * Índices recomendados para optimización
 */
export const RECOMMENDED_INDEXES = {
  products: [
    { user: 1, sku: 1 },
    { user: 1, category: 1 },
    { user: 1, stock: 1 },
    { user: 1, updatedAt: -1 },
    { name: 'text', description: 'text' }
  ],
  sales: [
    { user: 1, createdAt: -1 },
    { user: 1, 'items.product': 1 },
    { user: 1, total: -1 }
  ],
  clients: [
    { user: 1, email: 1 },
    { user: 1, name: 'text', email: 'text' }
  ]
};