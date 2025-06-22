import { DialogueTree } from '@/components/shared/types'

interface DialogueData {
  characterName: string
  characterInternalMonologue?: string
  steps: DialogueStepData[]
  successEnding?: string
  failureEnding?: string
}

interface DialogueStepData {
  stepNumber?: number
  characterInternalMonologue?: string
  options?: DialogueOptionData[]
}

interface DialogueOptionData {
  text?: string
  type?: string
  characterResponse?: string
  saleProgress?: string
}

/**
 * Load a dialogue tree from a JSON file or API response
 * @param dialogueData - The dialogue tree data
 * @returns A properly typed DialogueTree object
 */
export function loadDialogueTree(dialogueData: DialogueData): DialogueTree {
  // Validate the structure
  if (!dialogueData.characterName || !dialogueData.steps || !Array.isArray(dialogueData.steps)) {
    throw new Error('Invalid dialogue tree structure')
  }

  return {
    characterName: dialogueData.characterName,
    characterInternalMonologue: dialogueData.characterInternalMonologue || '',
    steps: dialogueData.steps.map((step: DialogueStepData, index: number) => ({
      stepNumber: step.stepNumber || index + 1,
      characterInternalMonologue: step.characterInternalMonologue || '',
      options: step.options?.map((option: DialogueOptionData) => ({
        text: option.text || '',
        type: (option.type as 'correct' | 'mildly_wrong' | 'very_wrong') || 'mildly_wrong',
        characterResponse: option.characterResponse || '',
        saleProgress: (option.saleProgress as 'progress' | 'neutral' | 'regress') || 'neutral'
      })) || []
    })),
    successEnding: dialogueData.successEnding || 'Success!',
    failureEnding: dialogueData.failureEnding || 'Failure!'
  }
}

/**
 * Get a random dialogue tree from a list of available dialogues
 * @param dialogues - Array of dialogue trees
 * @returns A random dialogue tree
 */
export function getRandomDialogue(dialogues: DialogueTree[]): DialogueTree {
  if (dialogues.length === 0) {
    throw new Error('No dialogues available')
  }
  
  const randomIndex = Math.floor(Math.random() * dialogues.length)
  return dialogues[randomIndex]
}

/**
 * Validate a dialogue tree structure
 * @param dialogue - The dialogue tree to validate
 * @returns True if valid, throws error if invalid
 */
export function validateDialogueTree(dialogue: DialogueData): boolean {
  if (!dialogue.characterName) {
    throw new Error('Dialogue tree must have a characterName')
  }
  
  if (!dialogue.steps || !Array.isArray(dialogue.steps)) {
    throw new Error('Dialogue tree must have a steps array')
  }
  
  if (dialogue.steps.length === 0) {
    throw new Error('Dialogue tree must have at least one step')
  }
  
  for (const step of dialogue.steps) {
    if (!step.options || !Array.isArray(step.options)) {
      throw new Error('Each step must have an options array')
    }
    
    if (step.options.length === 0) {
      throw new Error('Each step must have at least one option')
    }
    
    for (const option of step.options) {
      if (!option.text || !option.characterResponse) {
        throw new Error('Each option must have text and characterResponse')
      }
    }
  }
  
  return true
}

/**
 * Calculate the difficulty of a dialogue tree based on the ratio of correct vs wrong options
 * @param dialogue - The dialogue tree to analyze
 * @returns A difficulty score between 0 (easy) and 1 (hard)
 */
export function calculateDialogueDifficulty(dialogue: DialogueTree): number {
  let totalOptions = 0
  let correctOptions = 0
  
  for (const step of dialogue.steps) {
    for (const option of step.options) {
      totalOptions++
      if (option.type === 'correct') {
        correctOptions++
      }
    }
  }
  
  // Lower ratio of correct options = higher difficulty
  return 1 - (correctOptions / totalOptions)
}

/**
 * Get dialogue statistics
 * @param dialogue - The dialogue tree to analyze
 * @returns Statistics about the dialogue
 */
export function getDialogueStats(dialogue: DialogueTree) {
  const totalSteps = dialogue.steps.length
  let totalOptions = 0
  let correctOptions = 0
  let mildlyWrongOptions = 0
  let veryWrongOptions = 0
  
  for (const step of dialogue.steps) {
    for (const option of step.options) {
      totalOptions++
      switch (option.type) {
        case 'correct':
          correctOptions++
          break
        case 'mildly_wrong':
          mildlyWrongOptions++
          break
        case 'very_wrong':
          veryWrongOptions++
          break
      }
    }
  }
  
  return {
    totalSteps,
    totalOptions,
    correctOptions,
    mildlyWrongOptions,
    veryWrongOptions,
    difficulty: calculateDialogueDifficulty(dialogue),
    averageOptionsPerStep: totalOptions / totalSteps
  }
} 