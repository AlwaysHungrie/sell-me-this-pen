'use client'

import { useState, useEffect } from 'react'
import ChatLayout from '../layout/ChatLayout'

interface LoadingScreenProps {
  onLoadingComplete: () => void
  className?: string
}

export default function LoadingScreen({
  onLoadingComplete,
  className = '',
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)

  useEffect(() => {
    const totalDuration = 5000 // 5 seconds
    const interval = 50 // Update every 50ms for smoother animation
    const increment = (interval / totalDuration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment
        if (newProgress >= 100) {
          clearInterval(timer)
          setLoadingComplete(true)
          setTimeout(() => {
            onLoadingComplete()
          }, 800) // Small delay before calling onLoadingComplete
          return 100
        }
        return newProgress
      })
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete])

  return (
    <ChatLayout className={className}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full p-4 gap-6 overflow-y-auto lg:overflow-hidden">
        {/* Left Panel - Blinking Character Placeholder */}
        <div className="flex flex-col items-center justify-center w-full lg:w-72 flex-shrink-0 mb-6 lg:mb-0">
          <div className="relative">
            {/* Character Portrait Placeholder */}
            <div className="relative w-48 h-48 lg:w-56 lg:h-56 bg-neutral-800 rounded-lg p-1 border border-neutral-600">
              <div className="w-full h-full bg-neutral-700 rounded animate-pulse"></div>
            </div>

            {/* Character Name Placeholder */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-neutral-400 px-4 py-2 rounded border border-neutral-600 text-sm font-medium">
              Unknown
            </div>
          </div>
        </div>

        {/* Right Panel - Simple Loading Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-neutral-800 rounded-lg border border-neutral-600 p-8 flex flex-col justify-center">
            <div className="text-center max-w-lg mx-auto">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full bg-neutral-700 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-neutral-500 via-neutral-400 to-neutral-300 h-3 rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-neutral-400 text-sm font-medium">
                  {Math.round(progress)}% Complete
                </div>
              </div>

              {/* Main Message */}
              <h2 className="text-2xl font-semibold text-neutral-100 mb-8">
                Sit tight, we're getting a random person from the streets.
              </h2>

              {/* Completion Message - Removed to eliminate green flash */}
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  )
}
