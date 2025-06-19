import CircusLogo from '@/components/CircusLogo'
import CharacterScene from '@/components/CharacterScene'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/10 to-white/5 flex flex-col items-center px-8 py-4 gap-2">
      <CircusLogo />
      <CharacterScene />
    </div>
  )
}
