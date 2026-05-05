import { useState, useEffect } from 'react'

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

  useEffect(() => {
    function handler() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  function toggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  return { isFullscreen, toggle }
}

export default function FullscreenButton() {
  const { isFullscreen, toggle } = useFullscreen()

  return (
    <button
      onClick={toggle}
      className="hud-font text-[10px] tracking-wider px-2 py-1 rounded cursor-pointer transition-all hover:brightness-125"
      style={{
        background: 'rgba(15,23,42,0.7)',
        border: '1px solid rgba(100,116,139,0.3)',
        color: '#64748b',
      }}
    >
      {isFullscreen ? '⊡ EXIT' : '⛶ FULLSCREEN'}
    </button>
  )
}
