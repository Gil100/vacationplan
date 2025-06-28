import React, { useState, useEffect } from 'react'
import { use_offline } from '../../hooks/use_offline'

interface OfflineIndicatorProps {
  show_when_online?: boolean
  position?: 'top' | 'bottom'
  auto_hide_delay?: number
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  show_when_online = false,
  position = 'top',
  auto_hide_delay = 3000
}) => {
  const { is_online, pending_sync_count, last_sync, force_sync } = use_offline()
  const [visible, set_visible] = useState(false)
  const [is_syncing, set_is_syncing] = useState(false)

  // Show/hide logic
  useEffect(() => {
    if (!is_online) {
      set_visible(true)
    } else if (show_when_online && pending_sync_count > 0) {
      set_visible(true)
      
      if (auto_hide_delay > 0) {
        const timer = setTimeout(() => {
          set_visible(false)
        }, auto_hide_delay)
        
        return () => clearTimeout(timer)
      }
    } else if (show_when_online && last_sync) {
      set_visible(true)
      
      const timer = setTimeout(() => {
        set_visible(false)
      }, auto_hide_delay)
      
      return () => clearTimeout(timer)
    } else {
      set_visible(false)
    }
  }, [is_online, pending_sync_count, last_sync, show_when_online, auto_hide_delay])

  const handle_sync = async () => {
    set_is_syncing(true)
    try {
      await force_sync()
    } catch (error) {
      console.error('Manual sync failed:', error)
    } finally {
      set_is_syncing(false)
    }
  }

  if (!visible) return null

  const get_status_config = () => {
    if (!is_online) {
      return {
        icon: '📴',
        title: 'אין חיבור לאינטרנט',
        message: 'השינויים יישמרו ויסתנכרנו כשהחיבור יחזור',
        bg_color: 'bg-red-500',
        text_color: 'text-white',
        show_sync_button: false
      }
    } else if (pending_sync_count > 0) {
      return {
        icon: '🔄',
        title: 'מסנכרן נתונים',
        message: `${pending_sync_count} שינויים ממתינים לסנכרון`,
        bg_color: 'bg-yellow-500',
        text_color: 'text-white',
        show_sync_button: true
      }
    } else if (last_sync) {
      return {
        icon: '✅',
        title: 'הנתונים מסונכרנים',
        message: `עודכן לאחרונה: ${last_sync.toLocaleTimeString('he-IL')}`,
        bg_color: 'bg-green-500',
        text_color: 'text-white',
        show_sync_button: false
      }
    } else {
      return {
        icon: '🌐',
        title: 'מחובר לאינטרנט',
        message: 'הנתונים מעודכנים',
        bg_color: 'bg-blue-500',
        text_color: 'text-white',
        show_sync_button: false
      }
    }
  }

  const config = get_status_config()
  const position_classes = position === 'top' 
    ? 'top-0 safe-area-top' 
    : 'bottom-0 safe-area-bottom'

  return (
    <div className={`fixed left-0 right-0 ${position_classes} z-50 transform transition-transform duration-300`}>
      <div className={`${config.bg_color} ${config.text_color} px-4 py-3 shadow-lg`}>
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-lg" role="img" aria-label="status">
              {config.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {config.title}
              </div>
              <div className="text-xs opacity-90 truncate">
                {config.message}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {config.show_sync_button && (
              <button
                onClick={handle_sync}
                disabled={is_syncing}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors
                  ${is_syncing 
                    ? 'bg-white/20 cursor-not-allowed' 
                    : 'bg-white/30 hover:bg-white/40 active:bg-white/50'
                  } touch-target`}
              >
                {is_syncing ? (
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>מסנכרן</span>
                  </div>
                ) : (
                  'סנכרן עכשיו'
                )}
              </button>
            )}
            
            <button
              onClick={() => set_visible(false)}
              className="p-1 hover:bg-white/20 rounded-md transition-colors touch-target"
              aria-label="סגור התראה"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact version for minimal UI impact
export const OfflineIndicatorCompact: React.FC = () => {
  const { is_online, pending_sync_count } = use_offline()
  const [show_tooltip, set_show_tooltip] = useState(false)

  if (is_online && pending_sync_count === 0) return null

  const get_status = () => {
    if (!is_online) {
      return {
        icon: '📴',
        color: 'bg-red-500',
        tooltip: 'אין חיבור לאינטרנט'
      }
    } else if (pending_sync_count > 0) {
      return {
        icon: '🔄',
        color: 'bg-yellow-500',
        tooltip: `${pending_sync_count} שינויים ממתינים לסנכרון`
      }
    }
    return null
  }

  const status = get_status()
  if (!status) return null

  return (
    <div className="fixed top-4 left-4 z-50">
      <div
        className={`${status.color} text-white rounded-full p-2 shadow-lg cursor-pointer relative`}
        onMouseEnter={() => set_show_tooltip(true)}
        onMouseLeave={() => set_show_tooltip(false)}
        onClick={() => set_show_tooltip(!show_tooltip)}
      >
        <span className="text-sm" role="img" aria-label="connection status">
          {status.icon}
        </span>
        
        {show_tooltip && (
          <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-10">
            {status.tooltip}
            <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  )
}