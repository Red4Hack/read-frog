export interface ControlsConfig {
  findVideoContainer?: () => HTMLElement | null
  measureHeight: (container: HTMLElement) => number
  checkVisibility: (container: HTMLElement) => boolean
}

export interface PlatformConfig {
  embedded?: boolean
  silentErrors?: boolean
  containerShrinkRatio?: (container: HTMLElement) => number | null

  selectors: {
    video: string
    playerContainer: string
    controlsBar?: string
    nativeSubtitles: string
    // Optional broader selector used only to hide native captions. Falls back to
    // `nativeSubtitles` when omitted.
    nativeSubtitlesHide?: string
    // Optional selector for default (bottom-anchored) caption windows only, used
    // in "keep native" mode to hide normal captions while keeping custom ones.
    nativeSubtitlesBottom?: string
    // Optional native CC toggle button, used to sync the translation on/off state.
    nativeCaptionsButton?: string
  }

  events: {
    navigateStart?: string
    navigateFinish?: string
  }

  controls?: ControlsConfig

  getVideoId?: () => string | null
}
