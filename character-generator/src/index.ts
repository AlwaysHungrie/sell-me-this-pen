import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CharacterGenerator } from './character/CharacterGenerator';
import { ImageGenerator } from './character/ImageGenerator';
import { DialogueGenerator } from './character/DialogueGenerator';
import { PrismaService } from './services/PrismaService';
import { S3Service } from './services/S3Service';
import { DetailedCharacter, S3CharacterData } from './types';
import { TransactionService } from './services/TransactionService';
import { checkTransaction } from './services/checkTransaction';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
}));
app.use(express.json());

// Initialize services
const characterGenerator = new CharacterGenerator();
const imageGenerator = new ImageGenerator();
const prismaService = new PrismaService();
const s3Service = new S3Service();

// Connect to database
prismaService.connect().catch(console.error);

// Routes
app.get('/api/characters/random', async (req, res) => {
  try {
    const character = await prismaService.getRandomCharacter();
    
    if (!character) {
      return res.status(404).json({ 
        error: 'No characters found in database. Create some characters first.' 
      });
    }
    
    // Return the S3 data which contains the URLs
    res.json(character.s3Data);
  } catch (error) {
    console.error('Error getting random character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/characters', async (req, res) => {
  try {
    const { transactionHash } = req.body;
    
    if (!transactionHash) {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }

    const checkTx = await prismaService.getTransactionByHash(transactionHash);
    if (checkTx) {
      return res.status(200).json({ message: 'Transaction already used' });
    }

    const transactionService = new TransactionService();
    const result = await transactionService.analyzeTransaction(transactionHash);
    
    if (!result.isValid) {
      return res.status(400).json({ error: result.error });
    }

    const isTransactionValid = await checkTransaction(result);
    if (!isTransactionValid) {
      return res.status(200).json({ message: 'Invalid transaction' });
    }

    // Generate character with dialogue
    const generatedCharacter = characterGenerator.generateCharacter();
    const detailedCharacter = generatedCharacter as unknown as DetailedCharacter;
    const dialogueGenerator = new DialogueGenerator();
    const dialogueTree = await dialogueGenerator.generateDialogueTree(detailedCharacter);
    
    // Add dialogue tree to character
    detailedCharacter.dialogueTree = dialogueTree;
    
    // Generate image and add imageUrl to character
    let imageUrl: string | undefined;
    try {
      imageUrl = await imageGenerator.generateCharacterImage(detailedCharacter);
      detailedCharacter.imageUrl = imageUrl;
    } catch (err) {
      console.warn('Image generation failed:', err);
    }
    
    // Upload character data to S3
    const characterDataUrl = await s3Service.saveCharacterData(detailedCharacter);
    
    // Create S3 data object with URLs
    const s3Data: S3CharacterData = {
      imageUrl: imageUrl,
      dialogueUrl: characterDataUrl,
      metadata: {
        name: detailedCharacter.name,
        createdAt: new Date().toISOString(),
        characterArc: detailedCharacter.characterArc,
        gameRole: detailedCharacter.gameRole,
        difficulty: detailedCharacter.difficulty,
        rarity: detailedCharacter.rarity,
      }
    };
    
    // Save S3 data to database
    const savedCharacter = await prismaService.saveCharacter(s3Data);

    await prismaService.saveTransaction(transactionHash);

    res.status(201).json(savedCharacter.s3Data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/characters/:id', async (req, res) => {
  try {
    const character = await prismaService.getCharacterById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Return the S3 data which contains the URLs
    res.json(character.s3Data);
  } catch (error) {
    console.error('Error getting character:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Character Generator API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prismaService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prismaService.disconnect();
  process.exit(0);
}); 