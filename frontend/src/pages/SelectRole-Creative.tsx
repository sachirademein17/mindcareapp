import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function SelectRole() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 8
  }))

  const handleKeyPress = (event: React.KeyboardEvent, path: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      navigate(path)
    }
  }

  return (
    <div className="min-h-screen creative-patient-bg relative overflow-hidden">
      {/* Creative Artistic Overlay Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10"></div>
      </div>

      {/* Creative Particles System */}
      <div className="particles absolute inset-0">
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="particle absolute rounded-full bg-white/30"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animation: `sparkle 2s ease-in-out infinite ${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Artistic Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-30 blur-xl animate-bounce"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-30 blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-30 blur-xl animate-bounce"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 blur-xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Creative Artistic Header Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-6xl md:text-8xl font-extrabold creative-title font-dancing">
              MindCare
            </h1>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            <span className="creative-title">Choose Your Colorful Journey</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-comfortaa">
            Express yourself freely and discover vibrant mental wellness with our creative platform
          </p>
        </div>

        {/* Creative Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-6xl">
          {/* Doctor Card - Creative Artistic Theme */}
          <button
            onClick={() => navigate('/login/doctor')}
            onMouseEnter={() => setHoveredCard('doctor')}
            onMouseLeave={() => setHoveredCard(null)}
            onKeyDown={(e) => handleKeyPress(e, '/login/doctor')}
            className="group cursor-pointer w-full text-left transform transition-all duration-300 hover:scale-105"
            tabIndex={0}
          >
            <div className="relative creative-card p-10 overflow-hidden">
              {/* Artistic Icon Container */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-8 transition-all duration-500 ${hoveredCard === 'doctor' ? 'scale-125 animate-bounce' : 'animate-pulse'}`}>
                  <div className="w-28 h-28 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="text-6xl animate-bounce">🩺</div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 to-green-500/20"></div>
                  </div>
                </div>
                
                <h3 className="text-4xl font-bold text-gray-800 mb-4 font-comfortaa">
                  Creative Healer
                </h3>
                
                <p className="text-gray-700 text-xl mb-8 leading-relaxed font-comfortaa max-w-sm">
                  Express healing through creative arts and transform lives with colorful therapeutic approaches
                </p>
                
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">🎨</span>
                    <span className="font-medium">Art Therapy Tools</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">🌈</span>
                    <span className="font-medium">Colorful Patient Insights</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">✨</span>
                    <span className="font-medium">Creative Progress Tracking</span>
                  </div>
                </div>

                {/* Creative CTA Button */}
                <div className="mt-8">
                  <div className="creative-button">
                    Begin Creative Healing
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Patient Card - Creative Artistic Theme */}
          <button
            onClick={() => navigate('/login/patient')}
            onMouseEnter={() => setHoveredCard('patient')}
            onMouseLeave={() => setHoveredCard(null)}
            onKeyDown={(e) => handleKeyPress(e, '/login/patient')}
            className="group cursor-pointer w-full text-left transform transition-all duration-300 hover:scale-105"
            tabIndex={0}
          >
            <div className="relative creative-card p-10 overflow-hidden">
              {/* Artistic Icon Container */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-8 transition-all duration-500 ${hoveredCard === 'patient' ? 'scale-125 animate-bounce' : 'animate-pulse'}`}>
                  <div className="w-28 h-28 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="text-6xl animate-pulse">🧠</div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-500/20"></div>
                  </div>
                </div>
                
                <h3 className="text-4xl font-bold text-gray-800 mb-4 font-comfortaa">
                  Creative Explorer
                </h3>
                
                <p className="text-gray-700 text-xl mb-8 leading-relaxed font-comfortaa max-w-sm">
                  Embark on a colorful journey of self-discovery and wellness through creative expression
                </p>
                
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">🎭</span>
                    <span className="font-medium">Creative Expression Tools</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">🌻</span>
                    <span className="font-medium">Personalized Art Therapy</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">🦋</span>
                    <span className="font-medium">Transformative Wellness</span>
                  </div>
                </div>

                {/* Creative CTA Button */}
                <div className="mt-8">
                  <div className="creative-button">
                    Start Creative Journey
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Creative Admin Access Portal */}
        <div className="mt-16 group">
          <button
            onClick={() => navigate('/login/admin')}
            onKeyDown={(e) => handleKeyPress(e, '/login/admin')}
            className="creative-card rounded-2xl p-6 cursor-pointer transition-all duration-300 max-w-md mx-auto block transform hover:scale-105"
            tabIndex={0}
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-800 font-comfortaa">Creative Admin</h4>
                <p className="text-gray-600 text-sm">Artistic Management</p>
              </div>
            </div>
          </button>
        </div>

        {/* Creative Footer */}
        <div className="mt-20 text-center">
          <p className="text-2xl text-white/90 font-comfortaa mb-4">
            Express your creativity, heal your mind
          </p>
          <div className="flex justify-center space-x-2">
            {['🎨', '🌈', '✨', '🦋', '🌸'].map((icon, i) => (
              <span 
                key={`footer-icon-${icon}-${i}`}
                className="text-2xl animate-bounce" 
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
