'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import IosInstallModal from '@/components/pwa/ios-install-modal'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

type InstallAppButtonProps = {
  className?: string
}

function detectIos() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  return (
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function detectStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export default function InstallAppButton({
  className = '',
}: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isIos] = useState(() => detectIos())
  const [isStandalone] = useState(() => detectStandalone())
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return
    }

    if (isIos && !isStandalone) {
      setShowIosGuide(true)
    }
  }

  if (isStandalone) return null

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className={
          className ||
          'inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600'
        }
      >
        <Download className="h-4 w-4" />
        Cài ứng dụng
      </button>

      <IosInstallModal
        open={showIosGuide}
        onClose={() => setShowIosGuide(false)}
      />
    </>
  )
}