import { useEffect, useRef, useState } from 'react'

interface JitsiMeetComponentProps {
  roomName: string
  displayName: string
  onClose: () => void
  isDoctor?: boolean
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

const JitsiMeetComponent = ({ roomName, displayName, onClose, isDoctor = false }: JitsiMeetComponentProps) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI)
          return
        }

        const script = document.createElement('script')
        script.src = 'https://meet.jit.si/external_api.js'
        script.async = true
        script.onload = () => resolve(window.JitsiMeetExternalAPI)
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet'))
        document.head.appendChild(script)
      })
    }

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript()
        
        if (!jitsiContainerRef.current) return

        const domain = 'meet.jit.si'
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: displayName
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            enableClosePage: false,
            toolbarButtons: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'mute-video-everyone', 'security'
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
            APP_NAME: 'MindCare Meeting',
            NATIVE_APP_NAME: 'MindCare Meeting',
            PROVIDER_NAME: 'MindCare',
            HIDE_INVITE_MORE_HEADER: true,
          }
        }

        const jitsiApi = new window.JitsiMeetExternalAPI(domain, options)
        setApi(jitsiApi)
        setIsLoading(false)

        // Event listeners
        jitsiApi.addEventListener('readyToClose', () => {
          onClose()
        })

        jitsiApi.addEventListener('participantLeft', (data: any) => {
          console.log('Participant left:', data)
        })

        jitsiApi.addEventListener('videoConferenceJoined', (data: any) => {
          console.log('Conference joined:', data)
          setIsLoading(false)
        })

        jitsiApi.addEventListener('videoConferenceLeft', () => {
          console.log('Conference left')
          onClose()
        })

        // Set user role if doctor
        if (isDoctor) {
          jitsiApi.executeCommand('displayName', `Dr. ${displayName}`)
        }

      } catch (err) {
        console.error('Failed to initialize Jitsi:', err)
        setError('Failed to load video meeting. Please try again.')
        setIsLoading(false)
      }
    }

    initializeJitsi()

    return () => {
      if (api) {
        api.dispose()
      }
    }
  }, [roomName, displayName, isDoctor, onClose])

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Meeting Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">🎥 Joining Meeting...</h3>
            <p className="text-purple-200">Setting up your video conference</p>
          </div>
        </div>
      )}
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors shadow-lg"
        title="Leave Meeting"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Meeting info */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-lg">
        <div className="text-sm font-medium">🩺 MindCare Meeting</div>
        <div className="text-xs opacity-75">{displayName}</div>
      </div>

      {/* Jitsi container */}
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  )
}

export default JitsiMeetComponent
