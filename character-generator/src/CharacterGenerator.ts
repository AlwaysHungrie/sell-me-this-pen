import { Character, Personality, Demographics, PhysicalAttributes, Background, Skills, Relationships } from './types';
import {
  firstNames, lastNames, personalityTypes, ethnicities, nationalities, occupations,
  educationLevels, socioeconomicStatuses, locations, physicalTraits, distinctiveFeatures,
  skills, lifeEvents, motivations, fears, dreams, secrets, quirks, catchphrases,
  goals, conflicts, characterArcs, gameRoles
} from './constants/data';
import { DialogueGenerator } from './DialogueGenerator';
import { S3Service } from './S3Service';
import * as fs from 'fs';
import * as path from 'path';

export class CharacterGenerator {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateName(): string {
    const gender = this.getRandomElement(['male', 'female', 'neutral']);
    const firstName = this.getRandomElement(firstNames[gender as keyof typeof firstNames]);
    const lastName = this.getRandomElement(lastNames);
    return `${firstName} ${lastName}`;
  }

  private generatePersonality(): Personality {
    const personalityType = this.getRandomElement(personalityTypes);
    return {
      type: personalityType.type,
      traits: this.getRandomElements(personalityType.traits, this.getRandomNumber(2, 4)),
      strengths: this.getRandomElements(personalityType.strengths, this.getRandomNumber(2, 4)),
      weaknesses: this.getRandomElements(personalityType.weaknesses, this.getRandomNumber(1, 3)),
      communicationStyle: personalityType.communicationStyle,
      decisionMaking: personalityType.decisionMaking,
      socialPreference: personalityType.socialPreference
    };
  }

  private generateDemographics(): Demographics {
    return {
      age: this.getRandomNumber(16, 85),
      gender: this.getRandomElement(['Male', 'Female', 'Non-binary', 'Genderfluid', 'Agender']),
      ethnicity: this.getRandomElement(ethnicities),
      nationality: this.getRandomElement(nationalities),
      education: this.getRandomElement(educationLevels),
      occupation: this.getRandomElement(occupations),
      socioeconomicStatus: this.getRandomElement(socioeconomicStatuses),
      maritalStatus: this.getRandomElement(['Single', 'Married', 'Divorced', 'Widowed', 'In a relationship', 'It\'s complicated']),
      location: this.getRandomElement(locations)
    };
  }

  private generatePhysicalAttributes(): PhysicalAttributes {
    return {
      height: this.getRandomElement(physicalTraits.heights),
      build: this.getRandomElement(physicalTraits.builds),
      hairColor: this.getRandomElement(physicalTraits.hairColors),
      hairStyle: this.getRandomElement(physicalTraits.hairStyles),
      eyeColor: this.getRandomElement(physicalTraits.eyeColors),
      distinctiveFeatures: this.getRandomElements(distinctiveFeatures, this.getRandomNumber(0, 3)),
      clothingStyle: this.getRandomElement(physicalTraits.clothingStyles),
      posture: this.getRandomElement(physicalTraits.postures)
    };
  }

  private generateBackground(): Background {
    return {
      birthplace: this.getRandomElement(locations),
      familyBackground: this.getRandomElement([
        'Traditional nuclear family', 'Single parent household', 'Blended family',
        'Adopted', 'Orphaned', 'Raised by grandparents', 'Large extended family',
        'Military family', 'Religious family', 'Artistic family', 'Academic family'
      ]),
      childhood: this.getRandomElement([
        'Happy and carefree', 'Struggled with poverty', 'Overprotected',
        'Neglected', 'Abused', 'Privileged', 'Nomadic', 'Strict upbringing',
        'Free-spirited', 'Tragic', 'Mysterious', 'Ordinary'
      ]),
      lifeEvents: this.getRandomElements(lifeEvents, this.getRandomNumber(1, 4)),
      motivations: this.getRandomElements(motivations, this.getRandomNumber(1, 3)),
      fears: this.getRandomElements(fears, this.getRandomNumber(1, 3)),
      dreams: this.getRandomElements(dreams, this.getRandomNumber(1, 3)),
      secrets: this.getRandomElements(secrets, this.getRandomNumber(0, 2))
    };
  }

  private generateSkills(): Skills {
    return {
      primary: this.getRandomElements(skills.primary, this.getRandomNumber(2, 4)),
      secondary: this.getRandomElements(skills.secondary, this.getRandomNumber(1, 3)),
      hobbies: this.getRandomElements(skills.hobbies, this.getRandomNumber(2, 4)),
      languages: this.getRandomElements(skills.languages, this.getRandomNumber(1, 3)),
      specialAbilities: this.getRandomElements(skills.specialAbilities, this.getRandomNumber(0, 2))
    };
  }

  private generateRelationships(): Relationships {
    return {
      family: this.getRandomElements([
        'Close relationship with parents', 'Estranged from family', 'Only child',
        'Large family', 'Adopted siblings', 'Step-family', 'No living relatives',
        'Family business', 'Military family tradition', 'Academic family'
      ], this.getRandomNumber(1, 3)),
      friends: this.getRandomElements([
        'Large circle of friends', 'Few close friends', 'Loner',
        'Online friends only', 'Childhood friends', 'Work friends',
        'No friends', 'Friends from different walks of life'
      ], this.getRandomNumber(1, 2)),
      enemies: this.getRandomElements([
        'Former friend turned enemy', 'Work rival', 'Family feud',
        'Criminal organization', 'Government agency', 'Supernatural entity',
        'No enemies', 'Multiple enemies'
      ], this.getRandomNumber(0, 2)),
      romantic: this.getRandomElements([
        'Single and happy', 'In a relationship', 'Recently divorced',
        'Widowed', 'Multiple relationships', 'Never been in love',
        'Secret relationship', 'Complicated love life'
      ], this.getRandomNumber(1, 2)),
      mentors: this.getRandomElements([
        'Former teacher', 'Work supervisor', 'Family member',
        'Spiritual guide', 'Criminal mentor', 'No mentor',
        'Multiple mentors', 'Self-taught'
      ], this.getRandomNumber(0, 2)),
      rivals: this.getRandomElements([
        'Professional rival', 'Academic rival', 'Romantic rival',
        'Sibling rivalry', 'No rivals', 'Multiple rivals'
      ], this.getRandomNumber(0, 2))
    };
  }

  private generateQuirks(): string[] {
    return this.getRandomElements(quirks, this.getRandomNumber(1, 3));
  }

  private generateCatchphrases(): string[] {
    return this.getRandomElements(catchphrases, this.getRandomNumber(1, 2));
  }

  private generateGoals(): string[] {
    return this.getRandomElements(goals, this.getRandomNumber(1, 3));
  }

  private generateConflicts(): string[] {
    return this.getRandomElements(conflicts, this.getRandomNumber(1, 2));
  }

  private generateCharacterArc(): string {
    return this.getRandomElement(characterArcs);
  }

  private generateGameRole(): string {
    return this.getRandomElement(gameRoles);
  }

  private generateDifficulty(): 'easy' | 'medium' | 'hard' {
    const rand = Math.random();
    if (rand < 0.4) return 'easy';
    if (rand < 0.8) return 'medium';
    return 'hard';
  }

  private generateRarity(): 'common' | 'uncommon' | 'rare' | 'legendary' {
    const rand = Math.random();
    if (rand < 0.5) return 'common';
    if (rand < 0.8) return 'uncommon';
    if (rand < 0.95) return 'rare';
    return 'legendary';
  }

  public generateCharacter(): Character {
    return {
      id: this.generateId(),
      name: this.generateName(),
      personality: this.generatePersonality(),
      demographics: this.generateDemographics(),
      physicalAttributes: this.generatePhysicalAttributes(),
      background: this.generateBackground(),
      skills: this.generateSkills(),
      relationships: this.generateRelationships(),
      quirks: this.generateQuirks(),
      catchphrases: this.generateCatchphrases(),
      goals: this.generateGoals(),
      conflicts: this.generateConflicts(),
      characterArc: this.generateCharacterArc(),
      gameRole: this.generateGameRole(),
      difficulty: this.generateDifficulty(),
      rarity: this.generateRarity()
    };
  }

  // Utility function to sanitize filename
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .replace(/\s/g, '_'); // Replace spaces with underscores
  }

  // Function to save character to file
  public saveCharacterToFile(character: Character): string {
    try {
      // Create characters directory if it doesn't exist
      const charactersDir = path.join(__dirname, '..', '..', 'characters');
      if (!fs.existsSync(charactersDir)) {
        fs.mkdirSync(charactersDir, { recursive: true });
      }

      // Sanitize character name for filename
      const sanitizedName = this.sanitizeFilename(character.name);
      const filename = `${sanitizedName}.json`;
      const filepath = path.join(charactersDir, filename);

      // Save character as JSON
      fs.writeFileSync(filepath, JSON.stringify(character, null, 2), 'utf8');
      return filepath;
    } catch (error) {
      throw new Error(`Error saving character to file: ${error}`);
    }
  }

  // Function to save character to S3
  public async saveCharacterToS3(character: Character): Promise<string> {
    try {
      console.log('💾 Saving character data to S3...');
      const s3Url = await this.s3Service.saveCharacterData(character);
      console.log(`✅ Character saved to S3: ${s3Url}`);
      return s3Url;
    } catch (error) {
      throw new Error(`Error saving character to S3: ${error}`);
    }
  }

  // Function to generate and save a single character with dialogue to S3
  public async generateAndSaveCharacterWithDialogueToS3(): Promise<{ character: Character; s3Url: string }> {
    const character = this.generateCharacter();
    const dialogueGenerator = new DialogueGenerator();
    const dialogueTree = await dialogueGenerator.generateDialogueTree(character);
    
    // Add dialogue tree to character
    character.dialogueTree = dialogueTree;
    
    const s3Url = await this.saveCharacterToS3(character);
    return { character, s3Url };
  }

  // Function to generate and save a single character with dialogue
  public async generateAndSaveCharacterWithDialogue(): Promise<string> {
    const character = this.generateCharacter();
    const dialogueGenerator = new DialogueGenerator();
    return await dialogueGenerator.generateAndSaveDialogueTree(character);
  }
} 