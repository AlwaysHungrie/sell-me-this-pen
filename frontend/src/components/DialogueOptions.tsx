import { DialogueOption } from './types'

interface DialogueOptionsProps {
  options: DialogueOption[]
  isTyping: boolean
  onOptionSelect: (option: DialogueOption) => void
}

export default function DialogueOptions({ 
  options, 
  isTyping, 
  onOptionSelect 
}: DialogueOptionsProps) {
  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-600 flex-shrink-0 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <h3 className="text-neutral-200 font-medium mb-4 text-center">
        {isTyping ? 'Character is responding...' : 'Choose your response'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onOptionSelect(option)}
            disabled={isTyping}
            className={`text-left p-4 rounded-lg transition-all duration-300 border bg-neutral-800 text-neutral-200 transform animate-in slide-in-from-bottom-4 fade-in duration-500 ${
              isTyping 
                ? 'opacity-50 cursor-not-allowed border-neutral-700' 
                : 'hover:bg-neutral-700 hover:border-neutral-500 hover:text-neutral-100 hover:scale-[1.02] hover:shadow-lg border-neutral-600'
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <span className="font-medium text-sm leading-relaxed block">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
} 