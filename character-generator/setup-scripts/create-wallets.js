const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// For Ethereum address generation
const secp256k1 = require('secp256k1');

// For Solana address generation
const { Keypair } = require('@solana/web3.js');

/**
 * Keccak256 hash function implementation
 * @param {Buffer} data - Data to hash
 * @returns {Buffer} - Hashed data
 */
function keccak256(data) {
    // Use Node.js crypto for keccak256 (sha3-256)
    return crypto.createHash('sha3-256').update(data).digest();
}

/**
 * Generate Ethereum private key and address
 * @returns {Object} Object containing privateKey and address
 */
function generateEthereumWallet() {
    // Generate a random private key
    let privateKey;
    do {
        privateKey = crypto.randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));

    // Get the public key from private key
    const publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
    
    // Generate address from public key (remove first byte and hash with keccak256)
    const address = keccak256(publicKey).slice(-20);
    
    return {
        privateKey: privateKey.toString('hex'),
        address: '0x' + address.toString('hex')
    };
}

/**
 * Generate Solana private key and address
 * @returns {Object} Object containing privateKey and address
 */
function generateSolanaWallet() {
    // Generate a new Solana keypair
    const keypair = Keypair.generate();
    
    return {
        privateKey: Buffer.from(keypair.secretKey).toString('hex'),
        address: keypair.publicKey.toString()
    };
}

/**
 * Generate multiple wallets and save to file
 * @param {number} count - Number of wallets to generate
 * @param {string} outputFile - Output file path
 */
function generateWallets(count = 5, outputFile = 'wallets.json') {
    const wallets = {
        ethereum: [],
        solana: [],
        generatedAt: new Date().toISOString()
    };

    console.log(`Generating ${count} wallets for each blockchain...`);

    for (let i = 0; i < count; i++) {
        // Generate Ethereum wallet
        const ethWallet = generateEthereumWallet();
        wallets.ethereum.push({
            id: i + 1,
            privateKey: ethWallet.privateKey,
            address: ethWallet.address
        });

        // Generate Solana wallet
        const solWallet = generateSolanaWallet();
        wallets.solana.push({
            id: i + 1,
            privateKey: solWallet.privateKey,
            address: solWallet.address
        });

        console.log(`Generated wallet ${i + 1}:`);
        console.log(`  ETH: ${ethWallet.address}`);
        console.log(`  SOL: ${solWallet.address}`);
    }

    // Save to file
    const outputPath = path.join(__dirname, outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(wallets, null, 2));
    
    console.log(`\nWallets saved to: ${outputPath}`);
    console.log(`Generated ${count} wallets for each blockchain.`);
    
    return wallets;
}

/**
 * Generate a single wallet pair
 */
function generateSingleWallet() {
    const ethWallet = generateEthereumWallet();
    const solWallet = generateSolanaWallet();
    
    console.log('Generated Single Wallet:');
    console.log('\nEthereum:');
    console.log(`  Private Key: ${ethWallet.privateKey}`);
    console.log(`  Address: ${ethWallet.address}`);
    
    console.log('\nSolana:');
    console.log(`  Private Key: ${solWallet.privateKey}`);
    console.log(`  Address: ${solWallet.address}`);
    
    return { ethereum: ethWallet, solana: solWallet };
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'single':
            generateSingleWallet();
            break;
        case 'multiple':
            const count = parseInt(args[1]) || 5;
            const outputFile = args[2] || 'wallets.json';
            generateWallets(count, outputFile);
            break;
        default:
            console.log('Usage:');
            console.log('  node create-wallets.js single                    - Generate a single wallet pair');
            console.log('  node create-wallets.js multiple [count] [file]   - Generate multiple wallets (default: 5)');
            console.log('');
            console.log('Examples:');
            console.log('  node create-wallets.js single');
            console.log('  node create-wallets.js multiple 10 my-wallets.json');
            break;
    }
}

module.exports = {
    generateEthereumWallet,
    generateSolanaWallet,
    generateWallets,
    generateSingleWallet
};
