import { CharacterGenerator } from './CharacterGenerator';
import { ImageGenerator } from './ImageGenerator';

// Create instances
const generator = new CharacterGenerator();
const imageGen = new ImageGenerator();

async function main() {
  try {
    console.log('Generating character with dialogue and image...');
    
    // Generate character with dialogue
    const filepath = await generator.generateAndSaveCharacterWithDialogue();
    
    // Read the character data to add image
    const fs = require('fs');
    const characterData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // // Generate image and add imageUrl to character
    // try {
    //   console.log('Generating character image...');
    //   const imageUrl = await imageGen.generateCharacterImage(characterData);
    //   characterData.imageUrl = imageUrl;
    // } catch (err) {
    //   console.warn('Image generation failed:', err);
    //   characterData.imageUrl = 'Image generation failed';
    // }
    
    // // Save the updated character data back to file
    // fs.writeFileSync(filepath, JSON.stringify(characterData, null, 2), 'utf8');
    
    // console.log(`✅ Character with dialogue and image saved to: ${filepath}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 