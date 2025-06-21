import OpenAI from 'openai';
import { Character } from './types';
import { S3Service } from './S3Service';
import dotenv from 'dotenv';

dotenv.config();

export class ImageGenerator {
  private openai: OpenAI;
  private s3Service: S3Service;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.openai = new OpenAI({ apiKey });
    this.s3Service = new S3Service();
  }

  /**
   * Generate a caricature image for a character and upload to S3
   * Uses optimized prompts to minimize API usage while maintaining quality
   */
  async generateCharacterImage(character: Character): Promise<string> {
    try {
      const prompt = this.buildOptimizedPrompt(character);
      
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard", // Using standard quality to reduce costs
        style: "vivid" // Vivid style for more expressive caricatures
      });

      const imageUrl = response.data && response.data[0]?.url;
      if (!imageUrl) {
        throw new Error('Failed to generate image URL');
      }

      // Upload the image to S3 and return the S3 URL
      const s3ImageUrl = await this.s3Service.uploadImage(imageUrl, character.name);
      return s3ImageUrl;
    } catch (error) {
      console.error('Error generating character image:', error);
      throw error;
    }
  }

  /**
   * Build an optimized prompt that captures the character's essence
   * while minimizing token usage for cost efficiency
   */
  private buildOptimizedPrompt(character: Character): string {
    const { demographics, physicalAttributes, personality } = character;
    
    // Core physical description (most important for caricature)
    const physicalDesc = [
      `${demographics.age} year old ${demographics.gender.toLowerCase()}`,
      `${physicalAttributes.hairColor} ${physicalAttributes.hairStyle} hair`,
      `${physicalAttributes.eyeColor} eyes`,
      `${physicalAttributes.build.toLowerCase()} build`,
      physicalAttributes.distinctiveFeatures.length > 0 ? 
        `with ${physicalAttributes.distinctiveFeatures.slice(0, 2).join(', ')}` : ''
    ].filter(Boolean).join(', ');

    // Personality-based expression and pose
    const personalityDesc = this.getPersonalityExpression(personality.type);
    
    // Clothing style
    const clothingDesc = `${physicalAttributes.clothingStyle.toLowerCase()} clothing style`;
    
    // Ethnicity for better representation
    const ethnicityDesc = demographics.ethnicity !== 'Unknown' ? 
      `${demographics.ethnicity} ethnicity` : '';

    // Build the final prompt
    const prompt = [
      'Illustrated portrait of',
      physicalDesc,
      ethnicityDesc,
      `wearing ${clothingDesc}`,
      personalityDesc,
      'artistic illustration style, vibrant colors, detailed facial features, digital art, character design'
    ].filter(Boolean).join(', ');

    return prompt;
  }

  /**
   * Get personality-based expression and pose descriptions
   * Optimized for caricature style
   */
  private getPersonalityExpression(personalityType: string): string {
    const expressions: { [key: string]: string } = {
      'The Protagonist': 'confident heroic expression, determined pose',
      'The Strategist': 'calculating thoughtful expression, poised stance',
      'The Rebel': 'defiant rebellious expression, dynamic pose',
      'The Guardian': 'protective caring expression, steady stance',
      'The Mystic': 'mysterious enigmatic expression, ethereal pose',
      'The Entertainer': 'charismatic expressive face, animated pose',
      'The Scholar': 'intellectual curious expression, contemplative pose',
      'The Survivor': 'resilient weathered expression, strong stance'
    };

    return expressions[personalityType] || 'neutral expression, standard pose';
  }

  /**
   * Alternative method for generating images with different styles
   * Can be used for variety or specific character types
   */
  async generateCharacterImageWithStyle(
    character: Character, 
    style: 'caricature' | 'anime' | 'realistic' | 'cartoon' = 'caricature'
  ): Promise<string> {
    const basePrompt = this.buildOptimizedPrompt(character);
    const stylePrompts = {
      caricature: 'professional caricature art style, exaggerated features',
      anime: 'anime manga style, colorful, detailed',
      realistic: 'realistic portrait style, detailed features',
      cartoon: 'modern cartoon style, clean lines, vibrant colors'
    };

    const prompt = `${basePrompt}, ${stylePrompts[style]}`;

    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      const imageUrl = response.data && response.data[0]?.url;
      if (!imageUrl) {
        throw new Error('Failed to generate image URL');
      }

      return imageUrl;
    } catch (error) {
      console.error('Error generating character image:', error);
      throw error;
    }
  }
} 