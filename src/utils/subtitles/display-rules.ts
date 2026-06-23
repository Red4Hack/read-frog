import type { StateData, SubtitlesFragment } from "./types"
import type { SubtitlesDisplayMode } from "@/types/config/subtitles"

/**
 * When "keep original captions in place" is enabled, the native captions stay
 * visible (with their position/color) and the overlay should only render the
 * translation, regardless of the configured display mode.
 */
export function getEffectiveDisplayMode(
  displayMode: SubtitlesDisplayMode,
  keepNativeCaptions: boolean,
): SubtitlesDisplayMode {
  return keepNativeCaptions ? "translationOnly" : displayMode
}

export function hasRenderableSubtitleByMode(
  subtitle: SubtitlesFragment | null,
  displayMode: SubtitlesDisplayMode,
): boolean {
  if (!subtitle) return false

  if (displayMode === "translationOnly") return !!subtitle.translation

  return true
}

export function isAwaitingTranslation(
  subtitle: SubtitlesFragment | null,
  stateData: StateData | null,
): boolean {
  return subtitle ? !subtitle.translation : stateData?.state === "loading"
}
