import Image from 'next/image'

export default function DialogueHeader() {
  return (
    <div className="bg-neutral-800 border-b border-neutral-700 p-4 flex-shrink-0 relative min-h-12">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="absolute top-2 left-8 z-50">
            <Image src="/sign.png" alt="Sales Quest" width={100} height={100} className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}
