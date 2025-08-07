// Query performance analysis script
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Sale from '../models/Sale.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const analyzeQueryPerformance = async () => {
  try {
    console.log('⚡ ANALYZING QUERY PERFORMANCE\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get a test user for queries
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('❌ No users found. Please add some test data first.');
      return;
    }
    
    console.log(`🧪 Using test user: ${testUser.email}\n`);
    
    // Test common queries
    await testUserQueries();
    await testProductQueries(testUser._id);
    await testSalesQueries(testUser._id);
    await testTransactionQueries(testUser._id);
    
    console.log('\n✅ Query performance analysis completed!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

// Test user-related queries
const testUserQueries = async () => {
  console.log('👤 USER QUERIES');
  console.log('─'.repeat(30));
  
  // Email lookup (most common)
  await measureQuery(
    'User email lookup',
    () => User.findOne({ email: 'test@example.com' }).explain('executionStats')
  );
  
  // Google ID lookup
  await measureQuery(
    'User Google ID lookup',
    () => User.findOne({ googleId: 'google123' }).explain('executionStats')
  );
};

// Test product-related queries
const testProductQueries = async (userId) => {
  console.log('\n📦 PRODUCT QUERIES');
  console.log('─'.repeat(30));
  
  // User products (most common)
  await measureQuery(
    'User products list',
    () => Product.find({ user: userId }).limit(20).explain('executionStats')
  );
  
  // Product by SKU
  await measureQuery(
    'Product by SKU',
    () => Product.findOne({ user: userId, sku: 'TEST-001' }).explain('executionStats')
  );
  
  // Products by category
  await measureQuery(
    'Products by category',
    () => Product.find({ user: userId, category: 'Electronics' }).explain('executionStats')
  );
  
  // Low stock products
  await measureQuery(
    'Low stock products',
    () => Product.find({ 
      user: userId, 
      $expr: { $lte: ['$stock', '$reorderThreshold'] }
    }).explain('executionStats')
  );
  
  // Text search
  await measureQuery(
    'Product text search',
    () => Product.find({ 
      user: userId,
      $text: { $search: 'laptop' }
    }).explain('executionStats')
  );
};

// Test sales-related queries
const testSalesQueries = async (userId) => {
  console.log('\n💰 SALES QUERIES');
  console.log('─'.repeat(30));
  
  // Recent sales
  await measureQuery(
    'Recent sales',
    () => Sale.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .explain('executionStats')
  );
  
  // Sales by date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  await measureQuery(
    'Sales last 30 days',
    () => Sale.find({ 
      user: userId,
      createdAt: { $gte: startDate }
    }).explain('executionStats')
  );
  
  // Sales by payment method
  await measureQuery(
    'Sales by payment method',
    () => Sale.find({ 
      user: userId,
      paymentMethod: 'cash'
    }).explain('executionStats')
  );
};

// Test transaction-related queries
const testTransactionQueries = async (userId) => {
  console.log('\n💳 TRANSACTION QUERIES');
  console.log('─'.repeat(30));
  
  // Recent transactions
  await measureQuery(
    'Recent transactions',
    () => Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .explain('executionStats')
  );
  
  // Income vs expenses
  await measureQuery(
    'Income transactions',
    () => Transaction.find({ 
      user: userId,
      type: 'income'
    }).explain('executionStats')
  );
  
  // Transactions by category
  await measureQuery(
    'Transactions by category',
    () => Transaction.find({ 
      user: userId,
      category: 'Sales'
    }).explain('executionStats')
  );
};

// Helper function to measure query performance
const measureQuery = async (queryName, queryFn) => {
  try {
    const start = Date.now();
    const result = await queryFn();
    const duration = Date.now() - start;
    
    const stats = result.executionStats;
    const indexUsed = stats.totalDocsExamined === 0 || 
                     (stats.totalKeysExamined > 0 && stats.totalKeysExamined <= stats.totalDocsExamined);
    
    console.log(`${queryName}:`);
    console.log(`  ⏱️  Duration: ${duration}ms`);
    console.log(`  📄 Docs examined: ${stats.totalDocsExamined}`);
    console.log(`  🔑 Keys examined: ${stats.totalKeysExamined}`);
    console.log(`  📊 Docs returned: ${stats.executionStages?.nReturned || 0}`);
    console.log(`  ${indexUsed ? '✅' : '❌'} Index used: ${indexUsed ? 'Yes' : 'No'}`);
    
    if (!indexUsed) {
      console.log(`  ⚠️  Consider adding an index for better performance`);
    }
    
  } catch (error) {
    console.log(`${queryName}: ❌ Error - ${error.message}`);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeQueryPerformance();
}

export default analyzeQueryPerformance;