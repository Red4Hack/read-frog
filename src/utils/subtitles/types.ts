export type SubtitlesState = "idle" | "loading" | "error"

export interface StateData {
  state: SubtitlesState
  message?: string
}

/**
 * A run of original caption text that shares a single color.
 * Used to preserve colored/styled captions (e.g. per-speaker colors).
 */
export interface SubtitleColorSegment {
  text: string
  /** CSS color string (e.g. "#ff9800"). Undefined means use the configured color. */
  color?: string
}

export interface SubtitlesFragment {
  text: string
  start: number
  end: number
  translation?: string
  /**
   * Optional rich representation of the original `text`, split into colored runs.
   * When present (and the user enabled color preservation) the original line is
   * rendered span-by-span using these colors. `text` stays the plain concatenation
   * and remains the input used for translation.
   */
  segments?: SubtitleColorSegment[]
}
