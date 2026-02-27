console.log('Testing imports...');

try {
    console.log('1. Loading blockchain service...');
    const blockchainService = require('./services/blockchain.service');
    console.log('✅ Blockchain service loaded');

    console.log('2. Loading blockchain controller...');
    const blockchainController = require('./controllers/blockchainController');
    console.log('✅ Blockchain controller loaded');

    console.log('3. Loading server...');
    const app = require('./server');
    console.log('✅ Server loaded');

    console.log('\n✅ All imports successful!');
} catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error.stack);
}
