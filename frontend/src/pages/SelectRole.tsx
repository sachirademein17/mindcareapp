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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden font-inter">
      {/* Advanced Background with Liquid Animation */}
      <div className="absolute inset-0 animate-liquid opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-blue-600/20"></div>
      </div>

      {/* Floating Particles System */}
      <div className="particles absolute inset-0">
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="particle absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Morphing Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 animate-morphing opacity-20 filter blur-xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-400 animate-float3d opacity-20 filter blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-indigo-400 animate-breathe opacity-20 filter blur-xl"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-violet-400 animate-levitate opacity-20 filter blur-xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Spectacular Header Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-6xl md:text-8xl font-extrabold font-playfair text-holographic hover-glow animate-breathe">
              MindCare
            </h1>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-space">
            <span className="text-liquid animate-glow">Choose Your Journey</span>
          </h2>
          <p className="text-xl md:text-2xl text-purple-200 max-w-3xl mx-auto font-outfit leading-relaxed">
            Join our revolutionary mental health platform and connect with care that transforms lives
          </p>
        </div>

        {/* Enhanced Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-6xl">
          {/* Doctor Card - Professional Green Theme */}
          <button
            onClick={() => navigate('/login/doctor')}
            onMouseEnter={() => setHoveredCard('doctor')}
            onMouseLeave={() => setHoveredCard(null)}
            onKeyDown={(e) => handleKeyPress(e, '/login/doctor')}
            className="group cursor-pointer hover-lift w-full text-left"
            tabIndex={0}
          >
            <div className="relative glass-doctor rounded-3xl shadow-2xl p-10 border border-emerald-300/30 overflow-hidden animate-levitate glass-card-hover">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 doctor-accent opacity-5 rounded-3xl"></div>
              
              {/* Advanced Icon Container */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-8 transition-all duration-500 ${hoveredCard === 'doctor' ? 'scale-125 animate-breathe' : 'animate-float3d'}`}>
                  <div className="w-28 h-28 doctor-card rounded-full flex items-center justify-center backdrop-blur-md relative">
                    <div className="text-6xl animate-prism">🩺</div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 to-green-500/20 animate-breathe"></div>
                  </div>
                </div>
                
                <h3 className="text-4xl font-bold text-white mb-4 font-space gradient-doctor">
                  Healthcare Provider
                </h3>
                
                <p className="text-emerald-100 text-xl mb-8 leading-relaxed font-outfit max-w-sm">
                  Empower healing journeys and transform mental wellness with cutting-edge tools
                </p>
                
                <div className="space-y-3 text-emerald-200">
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">🔬</span>
                    <span className="font-medium">Advanced Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">👥</span>
                    <span className="font-medium">AI-Powered Patient Insights</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">📊</span>
                    <span className="font-medium">Real-time Progress Tracking</span>
                  </div>
                </div>

                {/* Enhanced CTA Button */}
                <div className="mt-8 px-8 py-4 btn-morphic btn-3d doctor-accent rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-300">
                  Begin Healing Journey
                </div>
              </div>
            </div>
          </button>

          {/* Patient Card - Calming Blue Theme */}
          <button
            onClick={() => navigate('/login/patient')}
            onMouseEnter={() => setHoveredCard('patient')}
            onMouseLeave={() => setHoveredCard(null)}
            onKeyDown={(e) => handleKeyPress(e, '/login/patient')}
            className="group cursor-pointer hover-lift w-full text-left"
            tabIndex={0}
          >
            <div className="relative glass-patient rounded-3xl shadow-2xl p-10 border border-sky-300/30 overflow-hidden animate-levitate glass-card-hover">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 patient-accent opacity-5 rounded-3xl"></div>
              
              {/* Advanced Icon Container */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-8 transition-all duration-500 ${hoveredCard === 'patient' ? 'scale-125 animate-breathe' : 'animate-float3d'}`}>
                  <div className="w-28 h-28 patient-card rounded-full flex items-center justify-center backdrop-blur-md relative">
                    <div className="text-6xl animate-prism">🧠</div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-500/20 animate-breathe"></div>
                  </div>
                </div>
                
                <h3 className="text-4xl font-bold text-white mb-4 font-space gradient-patient">
                  Seeking Wellness
                </h3>
                
                <p className="text-sky-100 text-xl mb-8 leading-relaxed font-outfit max-w-sm">
                  Begin your transformative journey to mental wellness with personalized, compassionate care
                </p>
                
                <div className="space-y-3 text-sky-200">
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">💬</span>
                    <span className="font-medium">24/7 AI-Powered Support</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">📅</span>
                    <span className="font-medium">Seamless Session Scheduling</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="text-2xl">🎯</span>
                    <span className="font-medium">Personalized Wellness Plans</span>
                  </div>
                </div>

                {/* Enhanced CTA Button */}
                <div className="mt-8 px-8 py-4 btn-morphic btn-3d patient-accent rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-300">
                  Start Your Wellness
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Admin Access Portal */}
        <div className="mt-16 group">
          <button
            onClick={() => navigate('/login/admin')}
            onKeyDown={(e) => handleKeyPress(e, '/login/admin')}
            className="glass-admin rounded-2xl p-6 border border-purple-300/30 cursor-pointer hover-glow transition-all duration-300 max-w-md mx-auto block"
            tabIndex={0}
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 admin-card rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-white gradient-admin font-space">Admin Portal</h4>
                <p className="text-purple-200 text-sm">System Management</p>
              </div>
            </div>
          </button>
        </div>

        {/* Spectacular Footer */}
        <div className="mt-20 text-center">
          <p className="text-2xl text-cosmic font-playfair animate-glow mb-4">
            Your transformation awaits
          </p>
          <div className="flex justify-center space-x-2">
            {['✨', '🌟', '💫', '⭐', '🌙'].map((icon, i) => (
              <span 
                key={`footer-icon-${icon}-${i}`}
                className="text-2xl animate-float3d" 
                style={{ animationDelay: `${i * 0.5}s` }}
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
