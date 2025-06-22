'use client'

export default function CharacterScene() {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 px-4 py-8">
      {/* Text Content - Left Side */}
      <div className="flex-1 max-w-2xl z-10">
        <div className="text-center lg:text-left">
          {/* Main Headline */}
          <h1 className="font-sedgwick-ave text-3xl md:text-4xl lg:text-5xl text-black leading-tight mb-12">
            Think you can sell a pen to anyone?
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-black mb-2 font-semibold">
            Take on a random weirdo from the streets.
          </p>

          {/* Description */}
          <p className="opacity-50 font-mono text-sm md:text-base lg:text-lg text-gray-500 leading-relaxed tracking-wide uppercase font-semibold mb-12">
            One shot. One false move. You lose everything.
          </p>

          {/* Call to Action Button */}
          <div className="pt-4 flex-col md:flex-row flex gap-2 md:gap-4 items-center">
            <a
              href="/chat"
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Selling
            </a>
            <div className="text-lg text-gray-500">(Free to play)</div>
          </div>
        </div>
      </div>

      {/* Character Image - Right Side */}
      <div className="flex-1 flex items-center justify-center lg:justify-end relative">
        <div className="relative w-full max-w-md lg:max-w-lg">
          <img
            src="/main-character.png"
            alt="Main Character"
            className="w-full h-auto object-contain drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
            }}
          />

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-red-500 rounded-full animate-bounce"></div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-gray-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-gray-400 transform rotate-45"></div>
      </div>
    </div>
  )
}
