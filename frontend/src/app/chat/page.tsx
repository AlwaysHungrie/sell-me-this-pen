'use client'

import { useEffect, useState } from 'react'
import { DialogueChat, DialogueTree, LoadingScreen } from '@/components'
import { characterAPI, CharacterData } from '@/lib/api'

export default function AgentPage() {
  const [dialogueTree, setDialogueTree] = useState<DialogueTree | null>(null)
  const [characterImage, setCharacterImage] = useState<string>('')
  const [characterData, setCharacterData] = useState<CharacterData>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGame, setShowGame] = useState(false)

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { character, dialogue } = await characterAPI.getFullCharacterData()
        
        setDialogueTree(dialogue.dialogueTree)
        setCharacterImage(character.imageUrl)
        setCharacterData(dialogue)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching character data:', err)
        setError('Failed to load character data. Please try again.')
        setLoading(false)
      }
    }

    fetchCharacterData()
  }, [])

  const handleLoadingComplete = () => {
    setShowGame(true)
  }

  const handleGameEnd = (result: 'success' | 'failure') => {
    console.log(`Game ended with result: ${result}`)
    // You can add additional logic here, like analytics or navigation
  }

  const handleNewCharacter = async () => {
    try {
      setLoading(true)
      setError(null)
      setShowGame(false)
      
      const { character, dialogue } = await characterAPI.getFullCharacterData()
      
      setDialogueTree(dialogue.dialogueTree)
      setCharacterImage(character.imageUrl)
      setCharacterData(dialogue)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching new character data:', err)
      setError('Failed to load new character data. Please try again.')
      setLoading(false)
    }
  }

  // Show loading screen if still loading or if we haven't completed the artificial delay
  if (loading || !showGame || !characterData) {
    return (
      <LoadingScreen onLoadingComplete={handleLoadingComplete} />
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-neutral-900 relative overflow-hidden">
        {/* Subtle texture overlay - same as DialogueChat */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show no data state
  if (!dialogueTree || !characterImage) {
    return (
      <div className="h-screen bg-neutral-900 relative overflow-hidden">
        {/* Subtle texture overlay - same as DialogueChat */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-white text-lg">No character data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DialogueChat
      dialogueTree={dialogueTree}
      characterImage={characterImage}
      onGameEnd={handleGameEnd}
      characterData={characterData}
      onNewCharacter={handleNewCharacter}
    />
  )
}
