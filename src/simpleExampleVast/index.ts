import { loadIma } from '../imaLoader'
import { ImaManager } from './ImaManager'
import { VAST_XML_URL } from '../variables'
import '../global.css'

function createAdService() {
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

  const startBtn = document.getElementById('startButton')
  startBtn?.addEventListener('click', () => {
    // Start to load current ad when start ad button clicked
    imaManager.requestAds(VAST_XML_URL)
  })

  const playBtn = document.getElementById('playButton')
  playBtn?.addEventListener('click', () => {
    imaManager.resume()
  })

  const pauseBtn = document.getElementById('pauseButton')
  pauseBtn?.addEventListener('click', () => {
    imaManager.pause()
  })

  const skipBtn = document.getElementById('skipButton')
  skipBtn?.addEventListener('click', () => {
    imaManager.skip()
  })
}

document.addEventListener('DOMContentLoaded', () => loadIma(createAdService))
