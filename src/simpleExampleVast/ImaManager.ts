import { google } from '@alugha/ima'

export class ImaManager {
  constructor(
    videoElement: HTMLVideoElement,
    adDisplayContainer: HTMLDivElement
  ) {
    this.videoElement = videoElement
    this.adContainer = adDisplayContainer
  }

  private videoElement: HTMLVideoElement
  private adContainer: HTMLElement
  private adsLoader?: google.ima.AdsLoader
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
   * Skip current ad
   */

  skip() {
    if (this.adsManager?.getAdSkippableState()) {
      this.adsManager?.skip()
    }
  }

  /**
   * Initialize adDisplayContainer and adsLoader
   * with handle errors and adsManager
   */

  init() {
    if (this.adsLoader) return
    const ima = window.google.ima

    const adDisplayContainer = new ima.AdDisplayContainer(this.adContainer)
    adDisplayContainer.initialize()

    this.adsLoader = new ima.AdsLoader(adDisplayContainer)

    this.adsLoader.addEventListener(
      ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this.onAdsManagerLoaded
    )

    this.adsLoader.addEventListener(
      ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError
    )
  }

  /**
   * @param adTagUrl - url with VAST
   *
   * Sends request to Ad with adsLoader instance
   */

  requestAds(adTagUrl: string) {
    if (!this.adsLoader) return
    if (this.adsManager) this.adsManager.destroy()
    console.info('Start to request ad')

    const adsRequest = new window.google.ima.AdsRequest()
    adsRequest.adTagUrl = adTagUrl

    this.adsLoader.requestAds(adsRequest)
  }

  /**
   * Handler for ADS_MANAGER_LOADED event
   */

  private onAdsManagerLoaded = (
    adsManagerLoadedEvent: google.ima.AdsManagerLoadedEvent
  ) => {
    console.info('Ads manager loaded')
    const ima = window.google.ima
    const adsRenderingSettings = new ima.AdsRenderingSettings()
    adsRenderingSettings.loadVideoTimeout = 9000

    this.adsManager = adsManagerLoadedEvent.getAdsManager(
      this.videoElement,
      adsRenderingSettings
    )

    this.adsManager.addEventListener(
      ima.AdEvent.Type.LOADED,
      this.adsManager.start
    )

    this.adsManager.addEventListener(
      ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError
    )

    this.adsManager.init(
      this.videoElement.clientWidth,
      this.videoElement.clientHeight,
      ima.ViewMode.NORMAL
    )
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
}
