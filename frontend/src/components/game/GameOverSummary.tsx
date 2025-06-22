'use client'

import { toast } from 'sonner'

interface GameOverSummaryProps {
  gameState: 'success' | 'failure'
  successEnding: string
  failureEnding: string
  onNewCharacter: () => void
  characterName: string
  characterImage: string
  lastCharacterMessage: string
}

// Custom toast component with vertical line
const CustomToast = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="w-1 h-full bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
    <div className="flex-1">{children}</div>
  </div>
)

export default function GameOverSummary({
  gameState,
  successEnding,
  failureEnding,
  onNewCharacter,
  characterName,
  characterImage,
  lastCharacterMessage,
}: GameOverSummaryProps) {
  const copyImageToClipboard = async () => {
    try {
      const response = await fetch(characterImage)
      const blob = await response.blob()

      // Create a canvas to convert the image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(async (blob) => {
          if (blob) {
            const item = new ClipboardItem({ 'image/png': blob })
            await navigator.clipboard.write([item])

            // First toast: Image copied
            toast.success(
              <CustomToast>
                <div>
                  <div className="font-medium">
                    {characterName}'s photo copied to clipboard
                  </div>
                </div>
              </CustomToast>,
              {
                duration: 3000,
              }
            )

            // Second toast: Redirecting to Twitter
            setTimeout(() => {
              toast.info(
                <CustomToast>
                  <div>
                    <div className="font-medium">Opening X in a new tab</div>
                  </div>
                </CustomToast>,
                {
                  duration: 5000,
                }
              )
            }, 1000)

            // Open Twitter after 5 seconds
            setTimeout(() => {
              const tweetText = generateTweetText()
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                tweetText
              )}`
              window.open(twitterUrl, '_blank')
            }, 6000)
          }
        }, 'image/png')
      }

      img.src = URL.createObjectURL(blob)
    } catch (error) {
      console.error('Failed to copy image:', error)
      toast.error(
        <CustomToast>
          <div>
            <div className="font-medium">Failed to copy image</div>
            <div className="text-sm text-gray-400">Please try again or share without the image</div>
          </div>
        </CustomToast>,
        {
          duration: 5000,
        }
      )
    }
  }

  const generateTweetText = () => {
    const result =
      gameState === 'success'
        ? 'successfully closed the deal'
        : 'failed to close the deal'

    return `Just encountered ${characterName} and ${result} in "Sell Me This Pen",

"${lastCharacterMessage}"

Can you take on a random person?
https://game.constella.one`
  }

  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-600 flex-shrink-0 animate-in slide-in-from-bottom-4 fade-in duration-500 relative">
      {/* Badge */}
      <div
        className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
          gameState === 'success'
            ? 'bg-green-900/50 text-green-400 border border-green-600'
            : 'bg-red-900/50 text-red-400 border border-red-600'
        }`}
      >
        {gameState === 'success' ? 'Deal Closed' : 'Deal Lost'}
      </div>

      <div className="pr-20">
        <h3
          className={`text-lg font-medium mb-2 ${
            gameState === 'success' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {gameState === 'success' ? 'Success!' : 'Failed'}
        </h3>
        <p className="text-neutral-300 text-sm mb-4 line-clamp-2">
          {gameState === 'success' ? successEnding : failureEnding}
        </p>

        <div className="flex gap-2">
          <button
            onClick={copyImageToClipboard}
            className="bg-black/10 hover:bg-neutral-900 text-white text-sm font-medium py-1 px-4 rounded transition-all duration-300 border border-neutral-700 hover:border-neutral-600 hover:scale-105 flex items-center gap-2"
          >
            Share <span className="hidden lg:inline">on</span>
            <img src="/x.svg" alt="X" className="w-6 h-6" />
          </button>
          <button
            onClick={onNewCharacter}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium py-2 px-4 rounded transition-all duration-300 border border-neutral-600 hover:border-neutral-500 hover:scale-105"
          >
            New Character
          </button>
        </div>
      </div>
    </div>
  )
}
