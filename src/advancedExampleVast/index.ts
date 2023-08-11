import { loadIma } from '../imaLoader'
import { ImaManager } from './ImaManager'
import { VAST_XML_URL } from '../variables'
import '../global.css'
import './local.css'

function createAdService() {
  // globally change locale
  window.google.ima.settings.setLocale('ru')

  // Get elements and init ad's manager
  const videoElement = document.getElementById(
    'videoElement'
  ) as HTMLVideoElement
  const adContainer = document.getElementById('adContainer') as HTMLDivElement

  if (videoElement === null || adContainer === null)
    throw Error('VideoElement or AdContainer not included in DOM')

  const imaManager = new ImaManager(videoElement, adContainer)

  // Init ima instance
  imaManager.init()

  // Activate controls
  addControlsHandlers(imaManager)
}

/**
 * Add listeners to controls
 */

function addControlsHandlers(imaManager: ImaManager) {
  const startBtn = document.getElementById('startButton')
  startBtn?.addEventListener('click', () => {
    // Start to load current ad when start ad button clicked
    imaManager.requestAds(VAST_XML_URL)
  })
  const playBtn = document.getElementById('playButton')
  playBtn?.addEventListener('click', () => {
    imaManager.resume()
  })

  const resumeButton = document.querySelector('.resume-button')
  resumeButton?.addEventListener('click', () => {
    imaManager.resume()
  })

  const pauseBtn = document.getElementById('pauseButton')
  pauseBtn?.addEventListener('click', () => {
    imaManager.pause()
  })
}

document.addEventListener('DOMContentLoaded', () => loadIma(createAdService))
