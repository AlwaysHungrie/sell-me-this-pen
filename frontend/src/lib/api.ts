import axios from 'axios'
import { DialogueTree } from '@/components'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export interface CharacterMetadata {
  name: string
  rarity: string
  gameRole: string
  createdAt: string
  difficulty: string
  characterArc: string
}

export interface CharacterResponse {
  imageUrl: string
  metadata: CharacterMetadata
  dialogueUrl: string
}

export interface CharacterData {
  id: string
  name: string
  personality: {
    type: string
    traits: string[]
    strengths: string[]
    weaknesses: string[]
    communicationStyle: string
    decisionMaking: string
    socialPreference: string
  }
  demographics: {
    age: number
    gender: string
    ethnicity: string
    nationality: string
    education: string
    occupation: string
    socioeconomicStatus: string
    maritalStatus: string
    location: string
  }
  physicalAttributes: {
    height: string
    build: string
    hairColor: string
    hairStyle: string
    eyeColor: string
    distinctiveFeatures: string[]
    clothingStyle: string
    posture: string
  }
  background: {
    birthplace: string
    familyBackground: string
    childhood: string
    lifeEvents: string[]
    motivations: string[]
    fears: string[]
    dreams: string[]
    secrets: string[]
  }
  skills: {
    primary: string[]
    secondary: string[]
    hobbies: string[]
    languages: string[]
    specialAbilities: string[]
  }
  relationships: {
    family: string[]
    friends: string[]
    enemies: string[]
    romantic: string[]
    mentors: string[]
    rivals: string[]
  }
  quirks: string[]
  catchphrases: string[]
  goals: string[]
  conflicts: string[]
  characterArc: string
  gameRole: string
  difficulty: string
  rarity: string
  imageUrl: string
  dialogueTree: DialogueTree
}

class CharacterAPI {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  })

  async getRandomCharacter(): Promise<CharacterResponse> {
    try {
      const response = await this.api.get<CharacterResponse>('/characters/random')
      return response.data
    } catch (error) {
      console.error('Error fetching random character:', error)
      throw new Error('Failed to fetch random character')
    }
  }

  async getCharacterDialogue(dialogueUrl: string): Promise<CharacterData> {
    try {
      const response = await axios.get<CharacterData>(dialogueUrl)
      return response.data
    } catch (error) {
      console.error('Error fetching character dialogue:', error)
      throw new Error('Failed to fetch character dialogue')
    }
  }

  async getFullCharacterData(): Promise<{ character: CharacterResponse; dialogue: CharacterData }> {
    try {
      const character = await this.getRandomCharacter()
      const dialogue = await this.getCharacterDialogue(character.dialogueUrl)
      return { character, dialogue }
    } catch (error) {
      console.error('Error fetching full character data:', error)
      throw new Error('Failed to fetch full character data')
    }
  }

  async createCharacter(transactionHash: string): Promise<CharacterResponse> {
    try {
      const response = await this.api.post<CharacterResponse>('/characters', {
        transactionHash
      }, {
        timeout: 300000
      })
      
      // Check if the response contains an error message
      if (response.data && typeof response.data === 'object' && 'message' in response.data) {
        const errorMessage = (response.data as { message: string }).message
        if (errorMessage && errorMessage !== 'Character created successfully') {
          throw new Error(errorMessage)
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Error creating character:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create character')
    }
  }
}

export const characterAPI = new CharacterAPI() 