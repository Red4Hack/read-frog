import type { StateData, SubtitlesFragment } from "./types"
import type { SubtitlesDisplayMode } from "@/types/config/subtitles"

/**
 * In "keep original" mode the overlay renders the original caption (with its
 * preserved colors) together with the translation, regardless of the configured
 * display mode.
 *
 * We intentionally render the original ourselves instead of relying on YouTube's
 * native captions staying on screen: native captions only stay visible for
 * top/positioned caption windows, while default bottom-anchored windows are
 * hidden to avoid overlapping the overlay. All auto-generated (ASR) captions use
 * the bottom window, so forcing "translationOnly" here used to drop the original
 * entirely for those videos.
 */
export function getEffectiveDisplayMode(
  displayMode: SubtitlesDisplayMode,
  keepOriginalCaptions: boolean,
): SubtitlesDisplayMode {
  return keepOriginalCaptions ? "bilingual" : displayMode
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
