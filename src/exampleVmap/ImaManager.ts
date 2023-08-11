import { google } from '@alugha/ima'
import ResizeObserver from 'resize-observer-polyfill'

export class ImaManager {
  constructor(
    videoElement: HTMLVideoElement,
    adDisplayContainer: HTMLDivElement
  ) {
    this.videoElement = videoElement
    this.adContainer = adDisplayContainer
    this.adsLoader = this.init()
    this.initResizeObserver()
  }

  private ima = window.google.ima
  private resumeButton = document.querySelector('.resume-button')
  private videoElement: HTMLVideoElement
  private adContainer: HTMLElement
  private adsLoader: google.ima.AdsLoader
  private adsManager?: google.ima.AdsManager

  /**
   * Resume current ad
   */

  resume() {
    this.adsManager?.resume()
  }

  /**
   * Pause current ad
   */

  pause() {
    this.adsManager?.pause()
  }

  /**
   * Initialize adDisplayContainer and adsLoader
   * with handle errors and adsManager
   */

  private init() {
    const adDisplayContainer = new this.ima.AdDisplayContainer(this.adContainer)
    adDisplayContainer.initialize()

    const adsLoader = new this.ima.AdsLoader(adDisplayContainer)

    adsLoader.addEventListener(
      this.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this.onAdsManagerLoaded
    )

    adsLoader.addEventListener(
      this.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError
    )

    return adsLoader
  }

  /**
   * @param adTagUrl - url with VAST
   *
   * Sends request to Ad with adsLoader instance
   */

  requestAds(adTagUrl: string) {
    if (this.adsManager) this.adsManager.destroy()
    console.info('Start to request ad')

    const adsRequest = new this.ima.AdsRequest()
    adsRequest.adTagUrl = adTagUrl

    this.adsLoader.requestAds(adsRequest)
  }

  /**
   * Handler for ADS_MANAGER_LOADED events
   */

  private onAdsManagerLoaded = (
    adsManagerLoadedEvent: google.ima.AdsManagerLoadedEvent
  ) => {
    console.info('Ads manager loaded')

    const adsRenderingSettings = new this.ima.AdsRenderingSettings()
    adsRenderingSettings.uiElements = [
      this.ima.UiElements.AD_ATTRIBUTION,
      this.ima.UiElements.COUNTDOWN,
    ]

    this.adsManager = adsManagerLoadedEvent.getAdsManager(
      this.videoElement,
      adsRenderingSettings
    )

    this.addContentCompletedHandler(this.adsManager)

    this.adsManager.init(
      this.videoElement.clientWidth,
      this.videoElement.clientHeight,
      this.ima.ViewMode.NORMAL
    )
    this.adsManager?.start()

    const imaEvents: google.ima.AdEvent.Type[] = [
      window.google.ima.AdEvent.Type.STARTED,
      window.google.ima.AdEvent.Type.PAUSED,
      window.google.ima.AdEvent.Type.RESUMED,
      window.google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,
      window.google.ima.AdEvent.Type.SKIPPED,
      window.google.ima.AdEvent.Type.CLICK,
      window.google.ima.AdEvent.Type.VOLUME_CHANGED,
      window.google.ima.AdEvent.Type.COMPLETE,
      window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
    ]

    imaEvents.forEach((imaEvent) =>
      this.adsManager?.addEventListener(imaEvent, this.onAdEvent)
    )

    this.adsManager.addEventListener(
      this.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError
    )
  }

  /**
   * Handler for AD events
   */

  onAdEvent = (
    adEvent: google.ima.AdEvent & { type?: google.ima.AdEvent.Type }
  ) => {
    console.info('AD EVENT: ', adEvent.type)

    switch (adEvent.type) {
      case window.google.ima.AdEvent.Type.PAUSED:
        this.resumeButton?.classList.remove('hidden')
        break
      case window.google.ima.AdEvent.Type.RESUMED:
        this.resumeButton?.classList.add('hidden')
        break
      case window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED:
        this.videoElement.pause()
        this.adContainer.classList.remove('backwards')
        break
      case window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED:
        this.videoElement.play()
        this.adContainer.classList.add('backwards')
        break
      case window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
        console.warn('ALL_ADS_COMPLETED - you need to reload page if you want more ads')
        break
      // look for warnings and errors with current ad
      case window.google.ima.AdEvent.Type.LOG:
        console.info(adEvent.getAdData())
        break
    }
  }

  /**
   * Handler for AD_ERROR events
   */

  private onAdError = (adErrorEvent: google.ima.AdErrorEvent) => {
    console.error(
      adErrorEvent.getError().getErrorCode(),
      adErrorEvent.getError().getMessage()
    )
  }

  /**
   * Function which observes video size and resize ad block
   */

  private initResizeObserver(): void {
    const resizeObserver = new ResizeObserver(() => {
      this.adsManager?.resize(
        this.videoElement.clientWidth,
        this.videoElement.clientHeight,
        window.google.ima.ViewMode.NORMAL
      )
    })

    resizeObserver.observe(this.videoElement)
  }

  /**
   * Check for postroll and add listener on ended video
   * Sends trigger to adsLoader to start postroll
   * @param adsManager
   */

  private addContentCompletedHandler(adsManager: google.ima.AdsManager) {
    const hasPostroll = adsManager.getCuePoints().slice(-1)[0] === -1

    if (!hasPostroll) return

    const onContentEnded = () => {
      if (hasPostroll) {
        this.adsLoader.contentComplete()
      }
      this.videoElement.removeEventListener('ended', onContentEnded)
    }

    this.videoElement.addEventListener('ended', onContentEnded)
  }
}
