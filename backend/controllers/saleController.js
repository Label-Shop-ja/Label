// C:\Proyectos\Label\backend\controllers\saleController.js
import Sale from '../models/Sale.js';
import Product from '../models/productModel.js';
import Transaction from '../models/Transaction.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import logInventoryMovement from '../utils/inventoryLogger.js';

// @desc    Registrar una nueva venta
// @route   POST /api/sales
// @access  Private
export const createSale = asyncHandler(async (req, res) => {
    const { productsSold, paymentMethod, customerName } = req.body;

    if (!productsSold || productsSold.length === 0) {
        res.status(400);
        throw new Error('No hay productos en la venta.');
    }
    if (!paymentMethod) {
        res.status(400);
        throw new Error('Por favor, especifica el método de pago.');
    }

    // --- INICIO DE LA TRANSACCIÓN ATÓMICA ---
    // 1. Iniciar una sesión de Mongoose
    const session = await mongoose.startSession();
    session.startTransaction(); // 2. Iniciar la transacción

    try {
        let totalAmount = 0;
        const productsForSale = []; // Para almacenar los detalles completos de los productos vendidos
        const logEntriesToCreate = []; // <-- ¡LISTA PARA GUARDAR LOS LOGS PENDIENTES!

        // 3. Validar productos y actualizar stock DENTRO de la transacción
        for (const item of productsSold) {
            // Usamos { session } para que la búsqueda y actualización sean parte de esta transacción
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                res.status(404);
                throw new Error(`Producto con ID ${item.product} no encontrado.`);
            }

            if (product.user.toString() !== req.user.id) {
                res.status(401);
                throw new Error('No autorizado para vender uno de estos productos.');
            }

            let currentStockToVerify;
            let targetStockContainer; // Referencia al objeto que contiene el stock (producto o variante)
            let variantDetailsForLog = {};
            let productSkuForLog = product.sku; // Por defecto el SKU del producto principal
            let priceToUse = product.price; // Por defecto el precio del producto principal

            // Lógica para manejar si el item es un producto principal o una variante
            if (item.variantId && product.variants && product.variants.length > 0) {
                const targetVariant = product.variants.id(item.variantId);
                if (!targetVariant) {
                    res.status(404);
                    throw new Error(`Variante con ID ${item.variantId} no encontrada para el producto: ${product.name}.`);
                }
                currentStockToVerify = targetVariant.stock;
                targetStockContainer = targetVariant; // Apuntamos al stock de la variante
                variantDetailsForLog = {
                    variantId: targetVariant._id,
                    variantName: targetVariant.name,
                };
                productSkuForLog = targetVariant.sku; // Usamos el SKU de la variante
                priceToUse = targetVariant.price; // Usamos el precio de la variante
            } else {
                currentStockToVerify = product.stock;
                targetStockContainer = product; // Apuntamos al stock del producto principal
            }

            if (currentStockToVerify < item.quantity) {
                res.status(400);
                throw new Error(`Stock insuficiente para el producto: ${product.name}${targetStockContainer.name ? ' - ' + targetStockContainer.name : ''}. Disponible: ${currentStockToVerify}, Solicitado: ${item.quantity}`);
            }

            // Descontar el stock de la variante o del producto principal
            targetStockContainer.stock -= item.quantity;
            // Guardamos el producto (que contiene la variante si se modificó) DENTRO de la sesión.
            await product.save({ session });

            // Calcular el monto total de la venta (usando el precio correcto: de la variante o del producto principal)
            const itemTotal = priceToUse * item.quantity;
            totalAmount += itemTotal;

            // Añadir detalles del producto/variante a la lista de productsSold en la Sale
            productsForSale.push({
                product: product._id,
                name: product.name, // El nombre del producto principal
                quantity: item.quantity,
                priceAtSale: priceToUse, // El precio al que se vendió (del producto o variante)
                // Si vendimos una variante, guardamos su ID en productsSold también
                ...(item.variantId && { variant: item.variantId }),
                // Podrías guardar más detalles de la variante aquí si los necesitas para el historial de ventas
            });

            // Preparar los datos del log de inventario para crearlos DESPUÉS de tener el ID de la venta
            logEntriesToCreate.push({
                user: req.user.id,
                product: product._id,
                ...variantDetailsForLog, // Incluye variantId y variantName si es una variante
                productName: product.name,
                sku: productSkuForLog,
                movementType: 'out',
                quantityChange: item.quantity,
                finalStock: targetStockContainer.stock, // El stock final del producto/variante
                reason: 'sale',
                // relatedSale se añadirá después de crear la venta
                session: session, // Pasa la sesión para que sea parte de la transacción
            });
        }

        // Crear la venta DENTRO de la transacción
        const sale = await Sale.create([{ // 'create' con un array y 'session' para transacciones
            user: req.user.id,
            productsSold: productsForSale,
            totalAmount,
            paymentMethod,
            customerName,
        }], { session }); // Pasamos la sesión aquí

        const createdSale = sale[0]; // create devuelve un array, tomamos el primer elemento

        // 5. Crear una transacción financiera de ingreso DENTRO de la transacción
        const financialTransaction = await Transaction.create([{ // 'create' con un array y 'session'
            user: req.user.id,
            description: `Venta #${createdSale._id.toString().substring(0, 8)} - ${customerName || 'Cliente General'}`,
            amount: totalAmount,
            type: 'income',
            category: 'Ventas',
        }], { session });

        const createdFinancialTransaction = financialTransaction[0]; // Tomamos el primer elemento

        // 6. Vincular la transacción financiera con la venta y guardar DENTRO de la transacción
        createdSale.financialTransaction = createdFinancialTransaction._id;
        await createdSale.save({ session });

        // AHORA SÍ: Registrar todos los movimientos de inventario recolectados,
        // con el ID de la venta que acabamos de crear
        for (const logData of logEntriesToCreate) {
            logData.relatedSale = createdSale._id; // ¡Ahora sí tenemos el ID de la venta!
            await logInventoryMovement(logData);
        }

        await session.commitTransaction(); // 7. Si todo sale bien, CONFIRMAR la transacción
        session.endSession(); // 8. Terminar la sesión

        res.status(201).json({
            sale: createdSale,
            financialTransaction: createdFinancialTransaction,
        });

    } catch (error) {
        await session.abortTransaction(); // Si algo falla, REVERTIR todos los cambios
        session.endSession(); // Terminar la sesión

        console.error('Error durante la transacción de venta:', error);

        // Manejo de errores más específico
        if (error.status) { // Si el error ya tiene un status code (ej. 400, 401, 404)
            res.status(error.status);
            throw new Error(error.message);
        } else { // Errores inesperados o de base de datos
            res.status(500);
            throw new Error('Error al procesar la venta. Por favor, inténtalo de nuevo. Detalle: ' + error.message);
        }
    }
});

// @desc    Obtener todas las ventas del usuario
// @route   GET /api/sales
// @access  Private
export const getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find({ user: req.user.id })
    .populate('productsSold.product', 'name price')
    .sort({ createdAt: -1 });
  res.status(200).json(sales);
});

// @desc    Obtener una venta por ID (opcional)
// @route   GET /api/sales/:id
// @access  Private
export const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate('productsSold.product', 'name price');

  if (!sale) {
    res.status(404);
    throw new Error('Venta no encontrada');
  }

  if (sale.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('No autorizado para ver esta venta');
  }

  res.status(200).json(sale);
});