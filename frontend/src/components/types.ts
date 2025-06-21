// Types for the dialogue system
export interface DialogueOption {
  text: string
  type: 'correct' | 'mildly_wrong' | 'very_wrong'
  characterResponse: string
  saleProgress: 'progress' | 'neutral' | 'regress'
}

export interface DialogueStep {
  stepNumber: number
  characterInternalMonologue: string
  options: DialogueOption[]
}

export interface DialogueTree {
  characterName: string
  characterInternalMonologue: string
  steps: DialogueStep[]
  successEnding: string
  failureEnding: string
}

export interface ChatMessage {
  id: string
  type: 'character' | 'player' | 'system' | 'internal'
  content: string
  timestamp: Date
  animationDelay?: number
}

export interface DialogueChatProps {
  dialogueTree: DialogueTree
  characterImage: string
  onGameEnd?: (result: 'success' | 'failure') => void
  className?: string
} 