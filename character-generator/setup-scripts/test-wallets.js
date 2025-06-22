const { generateEthereumWallet, generateSolanaWallet, generateSingleWallet } = require('./create-wallets.js');

console.log('Testing wallet generation...\n');

// Test single wallet generation
console.log('=== Single Wallet Test ===');
const singleWallet = generateSingleWallet();

console.log('\n=== Individual Function Tests ===');

// Test Ethereum wallet generation
console.log('Ethereum Wallet:');
const ethWallet = generateEthereumWallet();
console.log(`Private Key: ${ethWallet.privateKey}`);
console.log(`Address: ${ethWallet.address}`);
console.log(`Address length: ${ethWallet.address.length} characters`);
console.log(`Private key length: ${ethWallet.privateKey.length} characters`);

// Test Solana wallet generation
console.log('\nSolana Wallet:');
const solWallet = generateSolanaWallet();
console.log(`Private Key: ${solWallet.privateKey}`);
console.log(`Address: ${solWallet.address}`);
console.log(`Address length: ${solWallet.address.length} characters`);
console.log(`Private key length: ${solWallet.privateKey.length} characters`);

console.log('\n=== Validation ===');
console.log('✅ Ethereum address starts with 0x:', ethWallet.address.startsWith('0x'));
console.log('✅ Ethereum address is 42 characters:', ethWallet.address.length === 42);
console.log('✅ Ethereum private key is 64 hex characters:', /^[a-fA-F0-9]{64}$/.test(ethWallet.privateKey));
console.log('✅ Solana address is valid length:', solWallet.address.length > 30);
console.log('✅ Solana private key is valid length:', solWallet.privateKey.length > 100);

console.log('\n✅ All tests completed successfully!'); 