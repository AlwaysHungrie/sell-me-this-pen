'use client'

import { CharacterData } from '@/lib/api'
import Image from 'next/image'
import { useState } from 'react'

interface CharacterPanelProps {
  characterName: string
  characterImage: string
  progressScore: number
  characterData: CharacterData
}

export default function CharacterPanel({
  characterName,
  characterImage,
  progressScore,
  characterData,
}: CharacterPanelProps) {
  const { demographics, physicalAttributes, personality, background, skills, relationships, quirks, goals, conflicts } = characterData
  
  // Define the data sections to display
  const dataSections = [
    { 
      key: 'status', 
      title: 'Status', 
      data: {
        mood: progressScore >= 2 ? 'Receptive' : progressScore <= -1 ? 'Skeptical' : 'Neutral',
        interest: `${Math.max(0, progressScore + 2)}/5`,
        'Additional Info': 'Available'
      }
    },
    { key: 'demographics', title: 'Demographics', data: demographics },
    { key: 'physicalAttributes', title: 'Physical Attributes', data: physicalAttributes },
    { key: 'background', title: 'Background', data: background },
    { key: 'relationships', title: 'Relationships', data: relationships },
    { key: 'goals', title: 'Goals', data: goals },
    { key: 'conflicts', title: 'Conflicts', data: conflicts },
  ]

  const [currentPage, setCurrentPage] = useState(0)

  const renderDataSection = (section: any) => {
    if (!section.data) return null

    return (
      <div className="space-y-3">
        {Object.entries(section.data).map(([key, value]) => {
          if (value === null || value === undefined) return null
          
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
          
          if (Array.isArray(value)) {
            return (
              <div key={key} className="space-y-2">
                <span className="text-neutral-300 font-semibold text-sm block">{formattedKey}:</span>
                <div className="space-y-1.5 ml-3">
                  {value.map((item, index) => (
                    <div key={index} className="text-neutral-400 text-sm flex items-start">
                      <span className="text-neutral-500 mr-2 mt-1">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
          
          return (
            <div key={key} className="flex items-start space-x-2">
              <span className="text-neutral-300 font-semibold text-sm min-w-0 flex-shrink-0">
                {formattedKey}:
              </span>
              <span className={`text-sm ${
                key === 'mood' && progressScore >= 2
                  ? 'text-green-400 font-medium'
                  : key === 'mood' && progressScore <= -1
                  ? 'text-red-400 font-medium'
                  : 'text-neutral-400'
              }`}>
                {String(value)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-80 flex-shrink-0 mt-4">
      <div className="relative">
        {/* Character Portrait */}
        <div className="relative w-64 h-64 bg-neutral-800 rounded-xl p-2 border-2 border-neutral-600 shadow-lg">
          <div className="w-full h-full bg-neutral-900 rounded-lg overflow-hidden">
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
        <div className="text-center absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-neutral-100 px-6 py-3 rounded-lg border-2 border-neutral-600 text-base font-semibold shadow-lg">
          {characterName}
        </div>
      </div>

      {/* Character Data */}
      <div className="mt-8 w-full bg-neutral-800 rounded-xl border-2 border-neutral-600 shadow-lg">
        <h3 className="text-neutral-200 font-semibold mb-4 text-center text-base py-4 border-b border-neutral-700">
          Character Data
        </h3>
        
        {/* Current Section */}
        <div className="max-h-[120px] overflow-y-auto px-6 py-4">
          {dataSections[currentPage] && (
            <div>
              <h4 className="text-neutral-300 font-bold mb-4 text-sm uppercase tracking-wider border-b border-neutral-700 pb-2">
                {dataSections[currentPage].title}
              </h4>
              {renderDataSection(dataSections[currentPage])}
            </div>
          )}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center py-4 space-x-2 border-t border-neutral-700">
          {dataSections.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 cursor-pointer ${
                index === currentPage
                  ? 'bg-neutral-300 scale-125 shadow-md'
                  : 'bg-neutral-600 hover:bg-neutral-500 hover:scale-110'
              }`}
              aria-label={`Go to ${dataSections[index].title} section`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
