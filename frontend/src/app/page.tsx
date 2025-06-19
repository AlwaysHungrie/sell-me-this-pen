import CircusLogo from '@/components/CircusLogo'
import CharacterScene from '@/components/CharacterScene'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/20 to-white/5 flex flex-col items-center px-4 py-6 gap-6">
      {/* Header with Sign */}
      <div className="w-full max-w-4xl mx-auto text-center">
        <img 
          src="/sign.png" 
          alt="Sell Me This Pen" 
          className="max-h-32 md:max-h-40 w-auto mx-auto object-contain drop-shadow-lg" 
        />
      </div>
      
      {/* Main Content */}
      <CharacterScene />
    </div>
  )
}
