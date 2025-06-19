'use client'
import { useEffect, useState } from 'react'

export default function CharacterScene() {
  const [character, setCharacter] = useState(null)

  return (
    <div className="flex-1 w-full mt-8 min-h-0 max-w-screen-lg mx-auto relative">
      <div className="absolute bottom-0 right-0 h-full w-auto flex items-center justify-center">
        <img
          src={'/main-character.png'}
          alt="Main Character"
          className="w-auto h-full max-h-full object-contain object-right"
        />
      </div>
    </div>
  )
}
