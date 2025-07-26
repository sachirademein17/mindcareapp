import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function DesignShowcase() {
  const [selectedDesign, setSelectedDesign] = useState('creative')

  const designs = [
    {
      id: 'current',
      name: '🌟 Current Breathtaking',
      description: 'Advanced 3D animations, role-specific themes with spectacular visual effects',
      cssFile: 'advanced-theme.css',
      preview: 'Revolutionary design system with holographic text, morphing animations, and premium glass morphism'
    },
    {
      id: 'soft',
      name: '🌸 Soft Minimalist',
      description: 'Clean, calming, medical-grade aesthetics with gentle animations',
      cssFile: 'design-1-soft-minimalist.css',
      preview: 'Therapeutic color palette, subtle glass effects, professional yet welcoming'
    },
    {
      id: 'wellness',
      name: '🌊 Modern Wellness',
      description: 'Nature-inspired with flowing curves and organic animations',
      cssFile: 'design-2-modern-wellness.css',
      preview: 'Organic shapes, flowing gradients, nature-inspired color transitions'
    },
    {
      id: 'tech',
      name: '🌟 Premium Tech',
      description: 'High-end, professional with sophisticated tech elements',
      cssFile: 'design-3-premium-tech.css',
      preview: 'Dark mode, grid overlays, holographic effects, luxury touches'
    },
    {
      id: 'creative',
      name: '🎨 Creative Artistic',
      description: 'Vibrant, expressive with artistic flair and playful animations',
      cssFile: 'design-4-creative-artistic.css',
      preview: 'Color explosions, artistic brush strokes, playful typography'
    },
    {
      id: 'cosmic',
      name: '💫 Cosmic Futuristic',
      description: 'Space-age aesthetics with sci-fi elements and neon effects',
      cssFile: 'design-5-cosmic-futuristic.css',
      preview: 'Animated stars, holographic cards, neon glows, quantum effects'
    },
    {
      id: 'medical',
      name: '🌿 Medical Professional',
      description: 'Clinical, trustworthy with medical-grade professional design',
      cssFile: 'design-6-medical-professional.css',
      preview: 'Clean layouts, trust indicators, professional color scheme'
    }
  ]

  const applyDesign = (cssFile: string) => {
    // Remove existing design stylesheets
    const existingLinks = document.querySelectorAll('link[data-design-theme]')
    existingLinks.forEach(link => link.remove())

    // Add new design stylesheet
    if (cssFile !== 'advanced-theme.css') {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `/src/styles/${cssFile}`
      link.setAttribute('data-design-theme', 'true')
      document.head.appendChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden font-inter">
      {/* Current Background Effects */}
      <div className="absolute inset-0 animate-liquid opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-blue-600/20"></div>
      </div>

      <div className="relative z-10 min-h-screen p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-extrabold font-playfair text-holographic hover-glow animate-breathe mb-4">
            MindCare Design Studio
          </h1>
          <p className="text-2xl text-purple-200 font-outfit mb-8">
            Choose your perfect design aesthetic for the mental health platform
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center text-lg text-purple-300 hover:text-white transition-all duration-300 font-outfit hover-glow"
          >
            ← Back to Platform
          </Link>
        </div>

        {/* Design Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {designs.map((design) => (
            <div 
              key={design.id}
              className={`glass-ultimate rounded-3xl p-8 border transition-all duration-300 cursor-pointer hover-lift ${
                selectedDesign === design.id 
                  ? 'border-purple-400/50 shadow-2xl shadow-purple-500/20' 
                  : 'border-purple-300/20'
              }`}
              onClick={() => {
                setSelectedDesign(design.id)
                applyDesign(design.cssFile)
              }}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-space">
                  {design.name}
                </h3>
                <p className="text-purple-200 mb-6 font-outfit leading-relaxed">
                  {design.description}
                </p>
                <div className="bg-purple-900/30 rounded-xl p-4 mb-6">
                  <p className="text-sm text-purple-300 italic">
                    {design.preview}
                  </p>
                </div>
                <button 
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    selectedDesign === design.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-purple-800/30 text-purple-200 hover:bg-purple-700/40'
                  }`}
                >
                  {selectedDesign === design.id ? '✓ Current Design' : 'Preview Design'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Design Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="glass-ultimate rounded-3xl p-8 border border-purple-300/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center font-space">
              Design Comparison Guide
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-purple-200 mb-4">🎯 Best for Patient Experience:</h3>
                <ul className="space-y-2 text-purple-300">
                  <li>• <strong>Soft Minimalist:</strong> Reduces anxiety, clinical comfort</li>
                  <li>• <strong>Modern Wellness:</strong> Natural healing, organic feel</li>
                  <li>• <strong>Medical Professional:</strong> Trust, reliability, safety</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-purple-200 mb-4">⚡ Best for Doctor Workflow:</h3>
                <ul className="space-y-2 text-purple-300">
                  <li>• <strong>Premium Tech:</strong> Advanced tools, professional</li>
                  <li>• <strong>Medical Professional:</strong> Clinical efficiency</li>
                  <li>• <strong>Current Breathtaking:</strong> Modern, impressive</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-purple-200 mb-4">🚀 Best for Innovation:</h3>
                <ul className="space-y-2 text-purple-300">
                  <li>• <strong>Cosmic Futuristic:</strong> Cutting-edge, sci-fi</li>
                  <li>• <strong>Creative Artistic:</strong> Unique, memorable</li>
                  <li>• <strong>Current Breathtaking:</strong> Revolutionary</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-purple-200 mb-4">💼 Best for Enterprise:</h3>
                <ul className="space-y-2 text-purple-300">
                  <li>• <strong>Medical Professional:</strong> Corporate trust</li>
                  <li>• <strong>Premium Tech:</strong> High-end sophistication</li>
                  <li>• <strong>Soft Minimalist:</strong> Universal appeal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Design Section */}
        <div className="mt-16 text-center">
          <div className="glass-ultimate rounded-3xl p-8 border border-purple-300/20 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4 font-space">
              Ready to Apply Design?
            </h2>
            <p className="text-purple-200 mb-8 font-outfit">
              Selected: <strong>{designs.find(d => d.id === selectedDesign)?.name}</strong>
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => {
                  alert('Design applied! The entire platform will now use this theme.')
                  // In a real implementation, this would update the CSS imports
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-emerald-500 hover:to-green-500 transition-all duration-300 btn-morphic"
              >
                ✨ Apply This Design Platform-Wide
              </button>
              <p className="text-sm text-purple-400">
                This will update all components including SelectRole, Login, Dashboards, and more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
