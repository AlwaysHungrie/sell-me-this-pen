import Image from 'next/image'

interface MobileCharacterPortraitProps {
  characterName: string
  characterImage: string
}

export default function MobileCharacterPortrait({ 
  characterName, 
  characterImage 
}: MobileCharacterPortraitProps) {
  return (
    <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="relative">
        <div className="relative w-16 h-16 bg-neutral-800 rounded-lg p-1 border border-neutral-600">
          <Image
            src={characterImage}
            alt={characterName}
            fill
            unoptimized
            className="object-cover rounded"
          />
        </div>
        
        {/* Character Name */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-neutral-100 px-2 py-1 rounded text-xs font-medium border border-neutral-600 whitespace-nowrap">
          {characterName}
        </div>
      </div>
    </div>
  )
} 