interface GameOverSummaryProps {
  gameState: 'success' | 'failure'
  successEnding: string
  failureEnding: string
  onResetGame: () => void
}

export default function GameOverSummary({ 
  gameState, 
  successEnding, 
  failureEnding, 
  onResetGame 
}: GameOverSummaryProps) {
  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-600 flex-shrink-0 animate-in slide-in-from-bottom-4 fade-in duration-500 relative">
      {/* Badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
        gameState === 'success' 
          ? 'bg-green-900/50 text-green-400 border border-green-600' 
          : 'bg-red-900/50 text-red-400 border border-red-600'
      }`}>
        {gameState === 'success' ? 'Deal Closed' : 'Deal Lost'}
      </div>
      
      <div className="pr-20">
        <h3 className={`text-lg font-medium mb-2 ${
          gameState === 'success' ? 'text-green-400' : 'text-red-400'
        }`}>
          {gameState === 'success' ? 'Success!' : 'Failed'}
        </h3>
        <p className="text-neutral-300 text-sm mb-4 line-clamp-2">
          {gameState === 'success' ? successEnding : failureEnding}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={onResetGame}
            className="bg-neutral-700 hover:bg-neutral-600 text-neutral-100 text-sm font-medium py-2 px-4 rounded transition-all duration-300 border border-neutral-600 hover:border-neutral-500 hover:scale-105"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium py-2 px-4 rounded transition-all duration-300 border border-neutral-600 hover:border-neutral-500 hover:scale-105"
          >
            New Character
          </button>
        </div>
      </div>
    </div>
  )
} 