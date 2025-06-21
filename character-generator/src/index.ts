import { CharacterGenerator } from './CharacterGenerator';
import { ImageGenerator } from './ImageGenerator';

// Create instances
const generator = new CharacterGenerator();
const imageGen = new ImageGenerator();

async function main() {
  try {
    console.log('🚀 Generating character with dialogue and image...');
    
    // Generate character with dialogue and save to S3
    const { character, s3Url } = await generator.generateAndSaveCharacterWithDialogueToS3();
    
    console.log(`✅ Character with dialogue saved to S3: ${s3Url}`);
    
    // Generate image and add imageUrl to character
    try {
      console.log('🎨 Generating character image...');
      const imageUrl = await imageGen.generateCharacterImage(character);
      character.imageUrl = imageUrl;
      
      // Save the updated character data (with image URL) back to S3
      console.log('💾 Saving updated character data with image URL to S3...');
      const updatedS3Url = await generator.saveCharacterToS3(character);
      console.log(`✅ Updated character data saved to S3: ${updatedS3Url}`);
      
    } catch (err) {
      console.warn('⚠️ Image generation failed:', err);
      character.imageUrl = 'Image generation failed';
      
      // Still save the character data even if image generation failed
      const updatedS3Url = await generator.saveCharacterToS3(character);
      console.log(`✅ Character data saved to S3 (without image): ${updatedS3Url}`);
    }
    
    console.log('🎉 Character generation completed successfully!');
    console.log(`📊 Character: ${character.name}`);
    console.log(`🔗 S3 URL: ${s3Url}`);
    if (character.imageUrl && character.imageUrl !== 'Image generation failed') {
      console.log(`🖼️ Image URL: ${character.imageUrl}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 