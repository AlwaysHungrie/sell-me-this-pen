'use client'

import { useState, useEffect } from 'react'
import { DialogueTree, DialogueOption, ChatMessage, DialogueChatProps } from './types'
import { shuffleArray } from './utils'
import DialogueHeader from './DialogueHeader'
import CharacterPanel from './CharacterPanel'
import MessageList from './MessageList'
import DialogueOptions from './DialogueOptions'
import GameOverSummary from './GameOverSummary'
import MobileCharacterPortrait from './MobileCharacterPortrait'

export default function DialogueChat({ 
  dialogueTree, 
  characterImage, 
  onGameEnd,
  className = "" 
}: DialogueChatProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failure'>('playing')
  const [progressScore, setProgressScore] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [typingProgress, setTypingProgress] = useState(0)
  const [shuffledOptions, setShuffledOptions] = useState<DialogueOption[][]>([])

  // Typing animation effect
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setTypingProgress(prev => {
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
      const shuffled = dialogueTree.steps.map(step => shuffleArray(step.options))
      setShuffledOptions(shuffled)
      
      setMessages([
        {
          id: '1',
          type: 'character',
          content: `*${dialogueTree.characterName} appears before you, looking skeptical.*`,
          timestamp: new Date(),
          animationDelay: 0
        },
        {
          id: '2',
          type: 'internal',
          content: dialogueTree.characterInternalMonologue,
          timestamp: new Date(),
          animationDelay: 300
        }
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
      animationDelay: 0
    })

    // Add character's response
    newMessages.push({
      id: (Date.now() + 1).toString(),
      type: 'character',
      content: option.characterResponse,
      timestamp: new Date(),
      animationDelay: 300
    })

    // Update progress score
    let newScore = progressScore
    if (option.saleProgress === 'progress') newScore += 1
    else if (option.saleProgress === 'regress') newScore -= 1

    setProgressScore(newScore)
    setMessages(prev => [...prev, ...newMessages])

    // Check if game should end
    if (option.type === 'very_wrong' || newScore <= -2) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          type: 'system',
          content: dialogueTree.failureEnding,
          timestamp: new Date(),
          animationDelay: 0
        }])
        setGameState('failure')
        setIsTyping(false)
        onGameEnd?.('failure')
      }, 2000)
    } else if (currentStep + 1 >= dialogueTree.steps.length || newScore >= 3) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          type: 'system',
          content: dialogueTree.successEnding,
          timestamp: new Date(),
          animationDelay: 0
        }])
        setGameState('success')
        setIsTyping(false)
        onGameEnd?.('success')
      }, 2000)
    } else {
      // Move to next step
      setTimeout(() => {
        const nextStep = dialogueTree.steps[currentStep + 1]
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          type: 'internal',
          content: nextStep.characterInternalMonologue,
          timestamp: new Date(),
          animationDelay: 0
        }])
        setCurrentStep(currentStep + 1)
        setIsTyping(false)
      }, 2000)
    }
  }

  const resetGame = () => {
    setCurrentStep(0)
    setMessages([])
    setGameState('playing')
    setProgressScore(0)
    setIsTyping(false)
    setTypingProgress(0)
    setShuffledOptions([])
  }

  const getCurrentStep = () => dialogueTree.steps[currentStep]
  const getCurrentOptions = () => shuffledOptions[currentStep] || []

  return (
    <div className={`h-screen bg-neutral-900 relative overflow-hidden ${className}`}>
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <DialogueHeader 
          progressScore={progressScore}
          currentStep={currentStep}
          totalSteps={dialogueTree.steps.length}
        />

        {/* Main Interface */}
        <div className="flex-1 flex max-w-6xl mx-auto w-full p-4 gap-6 overflow-hidden">
          {/* Character Panel */}
          <CharacterPanel
            characterName={dialogueTree.characterName}
            characterImage={characterImage}
            currentStep={currentStep}
            totalSteps={dialogueTree.steps.length}
            progressScore={progressScore}
            gameState={gameState}
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
                onResetGame={resetGame}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Character Portrait */}
      <MobileCharacterPortrait
        characterName={dialogueTree.characterName}
        characterImage={characterImage}
      />
    </div>
  )
} 