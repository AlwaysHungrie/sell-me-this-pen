'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { characterAPI } from '@/lib/api'

interface NewCharacterModalProps {
  onClose: () => void
  onCharacterCreated?: (characterData: any) => void
  // TODO: Add a prop to handle character generation on successful transaction verification
  // onNewCharacter: (address: string) => void
}

// TODO: Replace with your actual addresses from .env files
const ETH_ADDRESS = process.env.NEXT_PUBLIC_ETH_ADDRESS || '0xYourEthAddressHere'
const SOLANA_ADDRESS = process.env.NEXT_PUBLIC_SOLANA_ADDRESS || 'YourSolanaAddressHere'

// Validation functions
const isValidEvmTxHash = (txHash: string): boolean => {
  // EVM transaction hash validation (0x followed by 64 hex characters)
  const evmRegex = /^0x[a-fA-F0-9]{64}$/
  return evmRegex.test(txHash)
}

const isValidSolanaTxHash = (txHash: string): boolean => {
  // Solana transaction hash validation (base58 string, typically 88 characters)
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{88}$/
  return solanaRegex.test(txHash)
}

const isValidTransactionHash = (txHash: string): boolean => {
  return isValidEvmTxHash(txHash) || isValidSolanaTxHash(txHash)
}

export default function NewCharacterModal({ onClose, onCharacterCreated }: NewCharacterModalProps) {
  const [transactionHash, setTransactionHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} address copied to clipboard`)
  }

  const handleSubmit = async () => {
    if (!transactionHash) {
      toast.error('Please enter your transaction hash.')
      return
    }

    if (!isTxHashValid) {
      toast.error('Please enter a valid transaction hash.')
      return
    }

    setIsLoading(true)
    
    try {
      const newCharacter = await characterAPI.createCharacter(transactionHash)
      toast.success('Character created successfully!')
      console.log('New character created:', newCharacter)
      onClose()
      if (onCharacterCreated) {
        onCharacterCreated(newCharacter)
      }
    } catch (error) {
      console.error('Error creating character:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create character. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isTxHashValid = isValidTransactionHash(transactionHash)

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose()
        }
      }}
    >
      <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700 w-full max-w-md relative text-center shadow-2xl m-4">
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-800/90 rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-white text-sm">Creating your character...</p>
              <p className="text-white text-sm">Do not refresh this page.</p>
            </div>
          </div>
        )}
        
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          <div className="w-32 h-32 rounded-full bg-neutral-800 border-4 border-neutral-700 flex items-center justify-center overflow-hidden">
            <Image
              src="/main-character.png"
              alt="Main Character"
              width={100}
              height={100}
            />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-3">
            Create a New Character
          </h2>
          <p className="text-neutral-400 text-sm mb-6">
            We're glad you're having fun! To generate a completely new
            character, please send <span className="font-bold text-white">3 USDC</span> on either Base, Scroll, or Solana to the
            corresponding address below.
          </p>

          <div className="space-y-4 mb-6 text-left">
            <div className="bg-neutral-900 p-3 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">
              Base / Scroll
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white font-mono text-sm break-all">
                  {ETH_ADDRESS}
                </span>
                <button
                  onClick={() => handleCopy(ETH_ADDRESS, 'ETH')}
                  disabled={isLoading}
                  className="p-1 rounded-md hover:bg-neutral-700 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Copy ETH address"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="bg-neutral-900 p-3 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Solana</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white font-mono text-sm break-all">
                  {SOLANA_ADDRESS}
                </span>
                <button
                  onClick={() => handleCopy(SOLANA_ADDRESS, 'Solana')}
                  disabled={isLoading}
                  className="p-1 rounded-md hover:bg-neutral-700 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Copy Solana address"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 text-left">
            <label
              htmlFor="transaction-hash"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Transaction Hash:
            </label>
            <input
              type="text"
              id="transaction-hash"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="Enter your transaction hash"
              disabled={isLoading}
              className={`w-full bg-neutral-900 border rounded-md py-2 px-3 text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                transactionHash && !isTxHashValid 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-neutral-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {transactionHash && !isTxHashValid && (
              <p className="text-red-400 text-xs mt-1">
                Please enter a valid EVM or Solana transaction hash
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`w-full bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-3 px-4 rounded-md transition-all duration-300 border border-transparent ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isTxHashValid || isLoading}
              className={`w-full font-medium py-3 px-4 rounded-md transition-all duration-300 border ${
                isTxHashValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
                  : 'bg-neutral-700 text-neutral-400 border-neutral-600 cursor-not-allowed'
              }`}
            >
              Verify & Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 