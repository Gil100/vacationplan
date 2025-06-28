import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface InstallPromptProps {
  auto_show?: boolean
  show_dismiss?: boolean
  position?: 'top' | 'bottom' | 'center'
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  auto_show = true,
  show_dismiss = true,
  position = 'bottom'
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches
      
      setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome)
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent
      e.preventDefault()
      setDeferredPrompt(event)
      
      if (auto_show && !isInstalled) {
        // Show prompt after a delay to avoid being too aggressive
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000)
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [auto_show, isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    
    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
    } catch (error) {
      console.error('Install prompt failed:', error)
    } finally {
      setIsInstalling(false)
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed, no prompt available, or user dismissed
  if (isInstalled || !deferredPrompt || !showPrompt) {
    return null
  }

  // Check if user already dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-4 right-4 safe-area-top'
      case 'bottom':
        return 'bottom-4 left-4 right-4 safe-area-bottom'
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default:
        return 'bottom-4 left-4 right-4 safe-area-bottom'
    }
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mx-auto max-w-sm">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">✈️</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              התקן את האפליקציה
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              קבל גישה מהירה, התראות ועבודה אופליין
            </p>
            
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                size="sm"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1 text-xs"
              >
                {isInstalling ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-3 w-3 me-1" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    מתקין...
                  </div>
                ) : (
                  'התקן'
                )}
              </Button>
              
              {show_dismiss && (
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  אחר כך
                </button>
              )}
            </div>
          </div>
          
          {show_dismiss && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="סגור"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Benefits list */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center">
              <span className="text-green-500 me-2">✓</span>
              גישה מהירה מבלי לפתוח דפדפן
            </div>
            <div className="flex items-center">
              <span className="text-green-500 me-2">✓</span>
              עבודה אופליין - גם בלי אינטרנט
            </div>
            <div className="flex items-center">
              <span className="text-green-500 me-2">✓</span>
              התראות על עדכונים חשובים
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact install button for header/navigation
export const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent
      e.preventDefault()
      setDeferredPrompt(event)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } catch (error) {
      console.error('Install failed:', error)
    } finally {
      setIsInstalling(false)
      setDeferredPrompt(null)
    }
  }

  if (isInstalled || !deferredPrompt) {
    return null
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleInstall}
      disabled={isInstalling}
      className="text-xs"
    >
      {isInstalling ? (
        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          <svg className="w-4 h-4 me-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          התקן אפליקציה
        </>
      )}
    </Button>
  )
}