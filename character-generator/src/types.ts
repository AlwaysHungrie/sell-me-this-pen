export interface S3CharacterData {
  imageUrl?: string;
  dialogueUrl?: string;
  metadata?: {
    name?: string;
    createdAt?: string;
    [key: string]: any;
  };
  [key: string]: any; // Allow for additional S3 URLs or data
}

export interface Character {
  id: string;
  s3Data: S3CharacterData;
  createdAt: Date;
  updatedAt: Date;
}

// Keep the original detailed types for internal use during generation
export interface Personality {
  type: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  communicationStyle: string;
  decisionMaking: string;
  socialPreference: string;
}

export interface Demographics {
  age: number;
  gender: string;
  ethnicity: string;
  nationality: string;
  education: string;
  occupation: string;
  socioeconomicStatus: string;
  maritalStatus: string;
  location: string;
}

export interface PhysicalAttributes {
  height: string;
  build: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  distinctiveFeatures: string[];
  clothingStyle: string;
  posture: string;
}

export interface Background {
  birthplace: string;
  familyBackground: string;
  childhood: string;
  lifeEvents: string[];
  motivations: string[];
  fears: string[];
  dreams: string[];
  secrets: string[];
}

export interface Skills {
  primary: string[];
  secondary: string[];
  hobbies: string[];
  languages: string[];
  specialAbilities: string[];
}

export interface Relationships {
  family: string[];
  friends: string[];
  enemies: string[];
  romantic: string[];
  mentors: string[];
  rivals: string[];
}

export interface DetailedCharacter {
  id: string;
  name: string;
  personality: Personality;
  demographics: Demographics;
  physicalAttributes: PhysicalAttributes;
  background: Background;
  skills: Skills;
  relationships: Relationships;
  quirks: string[];
  catchphrases: string[];
  goals: string[];
  conflicts: string[];
  characterArc: string;
  gameRole: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  imageUrl?: string;
  dialogueTree?: DialogueTree;
}

export interface DialogueOption {
  text: string;
  type: 'correct' | 'mildly_wrong' | 'very_wrong';
  characterResponse: string;
  saleProgress: 'progress' | 'regress' | 'neutral';
}

export interface DialogueStep {
  stepNumber: number;
  characterInternalMonologue: string;
  options: DialogueOption[];
}

export interface DialogueTree {
  characterName: string;
  characterInternalMonologue: string;
  steps: DialogueStep[];
  successEnding: string;
  failureEnding: string;
} 