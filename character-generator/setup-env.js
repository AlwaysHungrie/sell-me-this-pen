#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Character Generator Environment Setup\n');

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('If you need to update your API key, please edit the .env file manually.');
  process.exit(0);
}

console.log('📝 Creating .env file...');
console.log('You will need to add your OpenAI API key to this file.\n');

const envContent = `# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Model configuration (defaults to gpt-4o-mini for cost efficiency)
# OPENAI_MODEL=gpt-4o-mini
# OPENAI_TEMPERATURE=0.7
# OPENAI_MAX_TOKENS=2000
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Get your OpenAI API key from: https://platform.openai.com/api-keys');
  console.log('2. Edit the .env file and replace "your_openai_api_key_here" with your actual API key');
  console.log('3. Save the file');
  console.log('4. Run the character generator with: npm run generate-with-dialogue');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
} 