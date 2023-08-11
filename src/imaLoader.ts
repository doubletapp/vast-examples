import { loadImaSdk } from '@alugha/ima'

/**
 * Check for ad blocker and load ima instance or throw an error
 */

export async function loadIma(onImaLoaded: () => void) {
  const ima = await loadImaSdk().catch((err) =>
    console.error('IMA SDK could not be loaded. Check your ad blocker.')
  )

  if (ima) {
    console.info('IMA SDK successfully loaded.')
    onImaLoaded()
  }
}
