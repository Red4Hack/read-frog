import type { SubtitlesFragment } from "@/utils/subtitles/types"

export interface SubtitlesFetcher {
  fetch: () => Promise<SubtitlesFragment[]>
  cleanup: () => void
  shouldUseSameTrack: () => Promise<boolean>
  getSourceLanguage: () => string
  hasAvailableSubtitles: () => Promise<boolean>
  isPreSegmented?: () => boolean
  /**
   * Whether the video offers a ready (human, non auto-generated) caption track in
   * the given language. Used to optionally skip translation when an official
   * caption already exists in the user's language.
   */
  hasReadyTrackForLanguage?: (targetCode: string) => Promise<boolean>
}
