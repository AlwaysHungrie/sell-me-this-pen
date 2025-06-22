'use client'

import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import {
  DialogueOption,
  ChatMessage,
  DialogueChatProps,
  shuffleArray,
} from '../shared'
import CharacterPanel from './CharacterPanel'
import MessageList from './MessageList'
import DialogueOptions from './DialogueOptions'
import GameOverSummary from './GameOverSummary'
import ChatLayout from '../layout/ChatLayout'
import NewCharacterModal from './NewCharacterModal'
import { characterAPI } from '@/lib/api'

export default function DialogueChat({
  dialogueTree,
  characterImage,
  onGameEnd,
  className = '',
  characterData,
  onNewCharacter,
}: DialogueChatProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failure'>(
    'playing'
  )
  const [progressScore, setProgressScore] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [typingProgress, setTypingProgress] = useState(0)
  const [shuffledOptions, setShuffledOptions] = useState<DialogueOption[][]>([])
  const [isNewCharacterModalOpen, setIsNewCharacterModalOpen] =
    useState(false)

  // Typing animation effect
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setTypingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(interval)
    } else {
      setTypingProgress(0)
    }
  }, [isTyping])

  // Initialize shuffled options and conversation
  useEffect(() => {
    if (messages.length === 0) {
      // Shuffle options for each step
      const shuffled = dialogueTree.steps.map((step) =>
        shuffleArray(step.options)
      )
      setShuffledOptions(shuffled)

      setMessages([
        {
          id: '1',
          type: 'character',
          content: `*${dialogueTree.characterName} appears before you, looking skeptical.*`,
          timestamp: new Date(),
          animationDelay: 0,
        },
        {
          id: '2',
          type: 'internal',
          content: dialogueTree.characterInternalMonologue,
          timestamp: new Date(),
          animationDelay: 300,
        },
      ])
    }
  }, [dialogueTree, messages.length])

  const handleOptionSelect = (option: DialogueOption) => {
    setIsTyping(true)

    const newMessages: ChatMessage[] = []

    // Add player's choice
    newMessages.push({
      id: Date.now().toString(),
      type: 'player',
      content: option.text,
      timestamp: new Date(),
      animationDelay: 0,
    })

    // Add character's response
    newMessages.push({
      id: (Date.now() + 1).toString(),
      type: 'character',
      content: option.characterResponse,
      timestamp: new Date(),
      animationDelay: 300,
    })

    // Update progress score
    let newScore = progressScore
    if (option.saleProgress === 'progress') newScore += 1
    else if (option.saleProgress === 'regress') newScore -= 1

    setProgressScore(newScore)
    setMessages((prev) => [...prev, ...newMessages])

    // Check if game should end
    if (option.type === 'very_wrong' || newScore <= -2) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            type: 'system',
            content: dialogueTree.failureEnding,
            timestamp: new Date(),
            animationDelay: 0,
          },
        ])
        setGameState('failure')
        setIsTyping(false)
        onGameEnd?.('failure')
      }, 2000)
    } else if (currentStep + 1 >= dialogueTree.steps.length || newScore >= 3) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            type: 'system',
            content: dialogueTree.successEnding,
            timestamp: new Date(),
            animationDelay: 0,
          },
        ])
        setGameState('success')
        setIsTyping(false)
        onGameEnd?.('success')
      }, 2000)
    } else {
      // Move to next step
      setTimeout(() => {
        const nextStep = dialogueTree.steps[currentStep + 1]
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            type: 'internal',
            content: nextStep.characterInternalMonologue,
            timestamp: new Date(),
            animationDelay: 0,
          },
        ])
        setCurrentStep(currentStep + 1)
        setIsTyping(false)
      }, 2000)
    }
  }

  const getCurrentStep = () => dialogueTree.steps[currentStep]
  const getCurrentOptions = () => shuffledOptions[currentStep] || []

  // Get the last character message for sharing
  const getLastCharacterMessage = () => {
    const characterMessages = messages.filter(msg => msg.type === 'character')
    return characterMessages.length > 0 
      ? characterMessages[characterMessages.length - 1].content
      : `*${dialogueTree.characterName} appears before you, looking skeptical.*`
  }

  const handleNewCharacterCreated = async (characterResponse: any) => {
    try {
      // Load the full character data using the dialogue URL from the response
      const dialogue = await characterAPI.getCharacterDialogue(characterResponse.dialogueUrl)
      
      // Update the parent component with the new character data
      if (onNewCharacter) {
        // Pass the full character data to the parent
        const fullCharacterData = {
          character: characterResponse,
          dialogue: dialogue
        }
        onNewCharacter(fullCharacterData)
      }
    } catch (error) {
      console.error('Error loading new character data:', error)
    }
  }

  return (
    <ChatLayout className={className}>
      <Toaster 
        position="bottom-right"
        closeButton={false}
        duration={4000}
        expand={true}
        theme="dark"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
        }}
      />
      {/* Main Interface */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full p-4 gap-6 overflow-hidden">
        {/* Character Panel */}
        <CharacterPanel
          characterName={dialogueTree.characterName}
          characterImage={characterImage}
          progressScore={progressScore}
          characterData={characterData}
        />

        {/* Dialogue Panel */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <MessageList
            messages={messages}
            isTyping={isTyping}
            typingProgress={typingProgress}
          />

          {/* Options Area */}
          {gameState === 'playing' && getCurrentStep() && (
            <DialogueOptions
              options={getCurrentOptions()}
              isTyping={isTyping}
              onOptionSelect={handleOptionSelect}
            />
          )}

          {/* Game Over Summary */}
          {gameState !== 'playing' && (
            <GameOverSummary
              gameState={gameState}
              successEnding={dialogueTree.successEnding}
              failureEnding={dialogueTree.failureEnding}
              onNewCharacter={() => setIsNewCharacterModalOpen(true)}
              characterName={dialogueTree.characterName}
              characterImage={characterImage}
              lastCharacterMessage={getLastCharacterMessage()}
            />
          )}
        </div>
      </div>
      {isNewCharacterModalOpen && (
        <NewCharacterModal
          onClose={() => setIsNewCharacterModalOpen(false)}
          onCharacterCreated={handleNewCharacterCreated}
        />
      )}
    </ChatLayout>
  )
}
