interface DialogueHeaderProps {
  progressScore: number
  currentStep: number
  totalSteps: number
}

export default function DialogueHeader({ 
  progressScore, 
  currentStep, 
  totalSteps 
}: DialogueHeaderProps) {
  return (
    <div className="bg-neutral-800 border-b border-neutral-700 p-4 flex-shrink-0">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-neutral-600 rounded flex items-center justify-center">
            <span className="text-neutral-300 text-xs">⚔</span>
          </div>
          <h1 className="text-neutral-100 text-lg font-medium tracking-wide">Sales Quest</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-neutral-700 rounded px-3 py-1">
            <span className="text-neutral-200 text-sm">
              Progress: {progressScore > 0 ? '+' : ''}{progressScore}
            </span>
          </div>
          <div className="bg-neutral-700 rounded px-3 py-1">
            <span className="text-neutral-200 text-sm">
              Step {currentStep + 1}/{totalSteps}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 