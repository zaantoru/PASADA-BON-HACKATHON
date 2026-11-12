/** Prototype-only switches for demonstrating failure states. Not part of the real product. */
const KEY = 'pasada-ligtas:prototype:v1'

export interface PrototypeFlags {
  guideFailsOnce: boolean
  assistanceUnavailable: boolean
}

const defaults: PrototypeFlags = { guideFailsOnce: false, assistanceUnavailable: false }

export const prototypeFlags = {
  get(): PrototypeFlags {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
    } catch {
      return defaults
    }
  },
  set(patch: Partial<PrototypeFlags>) {
    localStorage.setItem(KEY, JSON.stringify({ ...this.get(), ...patch }))
  },
}
