import Image from 'next/image'

interface CharacterPanelProps {
  characterName: string
  characterImage: string
  currentStep: number
  totalSteps: number
  progressScore: number
  gameState: 'playing' | 'success' | 'failure'
}

export default function CharacterPanel({
  characterName,
  characterImage,
  currentStep,
  totalSteps,
  progressScore,
  gameState
}: CharacterPanelProps) {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center w-72 flex-shrink-0">
      <div className="relative">
        {/* Character Portrait */}
        <div className="relative w-56 h-56 bg-neutral-800 rounded-lg p-1 border border-neutral-600">
          <div className="w-full h-full bg-neutral-900 rounded overflow-hidden">
            <Image
              src={characterImage}
              alt={characterName}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
        
        {/* Character Name */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-neutral-100 px-4 py-2 rounded border border-neutral-600 text-sm font-medium">
          {characterName}
        </div>

        {/* Progress Indicator */}
        {gameState === 'playing' && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ease-out ${
                    index < currentStep 
                      ? 'bg-neutral-300 scale-110' 
                      : index === currentStep 
                      ? 'bg-neutral-500 scale-110' 
                      : 'bg-neutral-700 scale-100'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Character Status */}
      <div className="mt-6 w-full bg-neutral-800 rounded-lg p-4 border border-neutral-600">
        <h3 className="text-neutral-200 font-medium mb-3 text-center text-sm">Status</h3>
        <div className="space-y-2 text-neutral-300 text-sm">
          <div className="flex justify-between">
            <span>Mood:</span>
            <span className={`transition-colors duration-300 ${
              progressScore >= 2 ? 'text-green-400' : progressScore <= -1 ? 'text-red-400' : 'text-neutral-400'
            }`}>
              {progressScore >= 2 ? 'Receptive' : progressScore <= -1 ? 'Skeptical' : 'Neutral'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Interest:</span>
            <span className="text-neutral-300">{Math.max(0, progressScore + 2)}/5</span>
          </div>
        </div>
      </div>
    </div>
  )
} 