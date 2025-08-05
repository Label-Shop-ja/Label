// Database optimization script - Create indexes and analyze performance
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logInfo, logError } from '../utils/logger.js';

// Load environment variables
dotenv.config();

const optimizeDatabase = async () => {
  try {
    console.log('🔧 OPTIMIZING DATABASE INDEXES\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);
    
    // Optimize each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      
      console.log(`\n🔍 Analyzing collection: ${collectionName}`);
      
      // Get current indexes
      const currentIndexes = await collection.indexes();
      console.log(`   Current indexes: ${currentIndexes.length}`);
      
      // Collection-specific optimizations
      switch (collectionName) {
        case 'users':
          await optimizeUsersCollection(collection);
          break;
        case 'products':
          await optimizeProductsCollection(collection);
          break;
        case 'sales':
          await optimizeSalesCollection(collection);
          break;
        case 'transactions':
          await optimizeTransactionsCollection(collection);
          break;
        case 'inventorylogs':
          await optimizeInventoryLogsCollection(collection);
          break;
        case 'clients':
          await optimizeClientsCollection(collection);
          break;
        default:
          console.log(`   ⚠️  No specific optimization for ${collectionName}`);
      }
    }
    
    // Analyze database statistics
    await analyzeDatabaseStats(db);
    
    console.log('\n✅ Database optimization completed!');
    
  } catch (error) {
    logError('Database optimization failed', error);
    console.error('❌ Optimization failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

// Optimize Users collection
const optimizeUsersCollection = async (collection) => {
  const indexes = [
    { email: 1 }, // Unique email lookup
    { googleId: 1 }, // OAuth lookup
    { passwordResetToken: 1 }, // Password reset
    { createdAt: -1 } // Recent users
  ];
  
  await createIndexes(collection, indexes, 'users');
};

// Optimize Products collection
const optimizeProductsCollection = async (collection) => {
  const indexes = [
    { user: 1, sku: 1 }, // User products by SKU
    { user: 1, category: 1 }, // Products by category
    { user: 1, createdAt: -1 }, // Recent products
    { user: 1, stock: 1 }, // Stock levels
    { user: 1, isPerishable: 1, shelfLifeDays: 1 }, // Perishable products
    { 'variants.sku': 1 }, // Variant SKU lookup
    { user: 1, reorderThreshold: 1, stock: 1 } // Low stock alerts
  ];
  
  await createIndexes(collection, indexes, 'products');
};

// Optimize Sales collection
const optimizeSalesCollection = async (collection) => {
  const indexes = [
    { user: 1, createdAt: -1 }, // Recent sales by user
    { user: 1, paymentMethod: 1 }, // Sales by payment method
    { 'productsSold.product': 1 }, // Product sales history
    { user: 1, totalAmount: -1 }, // High-value sales
    { createdAt: -1 }, // Recent sales (all users)
    { user: 1, customerName: 1 } // Customer sales
  ];
  
  await createIndexes(collection, indexes, 'sales');
};

// Optimize Transactions collection
const optimizeTransactionsCollection = async (collection) => {
  const indexes = [
    { user: 1, createdAt: -1 }, // Recent transactions
    { user: 1, type: 1 }, // Income/expense filtering
    { user: 1, category: 1 }, // Category filtering
    { user: 1, amount: -1 }, // High-value transactions
    { createdAt: -1 } // Recent transactions (all users)
  ];
  
  await createIndexes(collection, indexes, 'transactions');
};

// Optimize InventoryLogs collection
const optimizeInventoryLogsCollection = async (collection) => {
  const indexes = [
    { user: 1, createdAt: -1 }, // Recent inventory changes
    { product: 1, createdAt: -1 }, // Product history
    { user: 1, product: 1, createdAt: -1 }, // User product history
    { relatedSale: 1 } // Sale-related logs
  ];
  
  await createIndexes(collection, indexes, 'inventorylogs');
};

// Optimize Clients collection
const optimizeClientsCollection = async (collection) => {
  const indexes = [
    { user: 1, email: 1 }, // Client lookup by email
    { user: 1, createdAt: -1 }, // Recent clients
    { user: 1, name: 1 } // Client name search
  ];
  
  await createIndexes(collection, indexes, 'clients');
};

// Helper function to create indexes
const createIndexes = async (collection, indexes, collectionName) => {
  let created = 0;
  let existing = 0;
  
  for (const index of indexes) {
    try {
      await collection.createIndex(index);
      created++;
      console.log(`   ✅ Created index: ${JSON.stringify(index)}`);
    } catch (error) {
      if (error.code === 85) { // Index already exists
        existing++;
      } else {
        console.log(`   ❌ Failed to create index ${JSON.stringify(index)}: ${error.message}`);
      }
    }
  }
  
  console.log(`   📊 ${collectionName}: ${created} created, ${existing} existing`);
};

// Analyze database statistics
const analyzeDatabaseStats = async (db) => {
  console.log('\n📈 DATABASE STATISTICS');
  console.log('─'.repeat(50));
  
  try {
    const stats = await db.stats();
    console.log(`Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Index size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Collections: ${stats.collections}`);
    console.log(`Objects: ${stats.objects}`);
    
    // Collection-specific stats
    const collections = ['users', 'products', 'sales', 'transactions'];
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        const collStats = await db.command({ collStats: collectionName });
        
        console.log(`\n${collectionName}:`);
        console.log(`  Documents: ${count}`);
        console.log(`  Size: ${(collStats.size / 1024).toFixed(2)} KB`);
        console.log(`  Indexes: ${collStats.nindexes}`);
      } catch (error) {
        console.log(`  ⚠️  Collection ${collectionName} not found or error: ${error.message}`);
      }
    }
  } catch (error) {
    console.log('❌ Failed to get database stats:', error.message);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeDatabase();
}

export default optimizeDatabase;