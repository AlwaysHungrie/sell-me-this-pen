'use client'

import { useRef, useEffect } from 'react'
import { ChatMessage } from '../shared'

interface MessageListProps {
  messages: ChatMessage[]
  isTyping: boolean
  typingProgress: number
}

export default function MessageList({ 
  messages, 
  isTyping, 
  typingProgress 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 bg-neutral-800 rounded-lg border border-neutral-600 p-4 mb-4 overflow-y-auto">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'player' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 fade-in duration-500 ease-out`}
            style={{
              animationDelay: `${message.animationDelay || 0}ms`,
              animationFillMode: 'both'
            }}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-lg transform transition-all duration-300 hover:scale-[1.02] ${
                message.type === 'player'
                  ? 'bg-neutral-700 text-neutral-100 border border-neutral-600 hover:border-neutral-500 hover:shadow-lg'
                  : message.type === 'character'
                  ? 'bg-neutral-600 text-neutral-100 border border-neutral-500 hover:border-neutral-400 hover:shadow-lg'
                  : message.type === 'internal'
                  ? 'bg-neutral-700/60 text-neutral-300 border border-neutral-600/50 hover:border-neutral-500/50 hover:shadow-lg backdrop-blur-sm'
                  : 'bg-neutral-700 text-neutral-100 border border-neutral-600 hover:border-neutral-500 hover:shadow-lg'
              }`}
            >
              <p className={`text-sm leading-relaxed ${message.type === 'internal' ? 'italic' : ''}`}>
                {message.content}
              </p>
              <p className="text-xs text-neutral-400 mt-1 opacity-0 animate-in fade-in duration-300 delay-500">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-neutral-600 text-neutral-100 px-4 py-3 rounded-lg border border-neutral-500 relative overflow-hidden">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              {/* Typing progress bar */}
              <div className="absolute bottom-0 left-0 h-0.5 bg-neutral-400 transition-all duration-100 ease-out" 
                   style={{ width: `${typingProgress}%` }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 