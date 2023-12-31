import { loadIma } from '../imaLoader'
import { ImaManager } from './ImaManager'
import { VMAP_XML_URL } from '../variables'
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

  // update: init IMA in constructor
  const imaManager = new ImaManager(videoElement, adContainer)

  // preload VMAP
  imaManager.requestAds(VMAP_XML_URL)

  handleControls(imaManager)

  // trigger playing ad on play video
  videoElement.addEventListener('play', onVideoPlay)

  function onVideoPlay() {
    imaManager.startAd()
    videoElement.removeEventListener('play', onVideoPlay)
  }
}

function handleControls(imaManager: ImaManager) {
  // Activate controls
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
