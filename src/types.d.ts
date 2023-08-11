import { ImaSdk } from '@alugha/ima'

declare global {
  interface Window {
    google: { ima: ImaSdk }
  }
}