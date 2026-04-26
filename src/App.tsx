import { useEffect, useState } from "react"
import DongConverter from "./components/DongConverter"
import "./App.css"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type InstallSurface = "prompt" | "ios" | null

const INSTALL_DISMISSED_KEY = "dingdong_install_dismissed_v1"

const isRunningStandalone = () => {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  )
}

const isIosSafari = () => {
  const userAgent = navigator.userAgent
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent)
  const isSafariBrowser =
    /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent)

  return isIosDevice && isSafariBrowser
}

function App() {
  const [installSurface, setInstallSurface] = useState<InstallSurface>(null)
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)
  const [hasShownInstallModal, setHasShownInstallModal] = useState(false)
  const [installDismissed, setInstallDismissed] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem(INSTALL_DISMISSED_KEY) === "1"
  })

  useEffect(() => {
    setHasShownInstallModal(false)
  }, [installSurface])

  useEffect(() => {
    if (!installSurface || isInstallModalOpen || hasShownInstallModal) return

    const timeoutId = window.setTimeout(() => {
      setIsInstallModalOpen(true)
      setHasShownInstallModal(true)
    }, 5000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [hasShownInstallModal, installSurface, isInstallModalOpen])

  useEffect(() => {
    if (!installDismissed && isIosSafari() && !isRunningStandalone()) {
      setInstallSurface("ios")
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      if (installDismissed || isRunningStandalone()) return

      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
      setInstallSurface("prompt")
    }

    const handleAppInstalled = () => {
      window.localStorage.removeItem(INSTALL_DISMISSED_KEY)
      setInstallDismissed(false)
      setInstallSurface(null)
      setInstallPrompt(null)
      setIsInstallModalOpen(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      )
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [installDismissed])

  const dismissInstallUi = () => {
    window.localStorage.setItem(INSTALL_DISMISSED_KEY, "1")
    setInstallDismissed(true)
    setInstallSurface(null)
    setInstallPrompt(null)
    setIsInstallModalOpen(false)
  }

  const handleInstallClick = async () => {
    if (installSurface !== "prompt" || !installPrompt) return

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === "accepted") {
      setInstallSurface(null)
      setIsInstallModalOpen(false)
      setInstallPrompt(null)
      return
    }

    dismissInstallUi()
  }

  return (
    <main className='app-shell'>
      <div className='app-header'>
        <h1 className='app-title'>DingDong</h1>
      </div>

      <DongConverter />

      {installSurface && isInstallModalOpen && (
        <div className='install-modal-backdrop' role='presentation'>
          <div
            className='install-modal'
            role='dialog'
            aria-modal='true'
            aria-labelledby='install-title'>
            <h2 id='install-title'>Install DingDong</h2>
            {installSurface === "prompt" ? (
              <p>
                Add DingDong to your home screen for faster access and offline
                use.
              </p>
            ) : (
              <>
                <p>
                  On iPhone and iPad, install uses Safari&apos;s Share menu
                  instead of the browser install prompt.
                </p>
                <ol className='install-steps'>
                  <li>Tap the Share button in Safari.</li>
                  <li>Select Add to Home Screen.</li>
                  <li>Tap Add to finish installing DingDong.</li>
                </ol>
              </>
            )}
            <div className='install-actions'>
              <button
                type='button'
                className='install-button secondary'
                onClick={dismissInstallUi}>
                Later
              </button>
              {installSurface === "prompt" ? (
                <button
                  type='button'
                  className='install-button'
                  onClick={handleInstallClick}>
                  Install app
                </button>
              ) : (
                <button
                  type='button'
                  className='install-button'
                  onClick={() => setIsInstallModalOpen(false)}>
                  Got it
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
