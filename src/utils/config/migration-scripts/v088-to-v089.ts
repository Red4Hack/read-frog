/**
 * Migration script from v088 to v089
 * - Replaces the conflicting `keepNativeCaptions` and
 *   `skipWhenTargetCaptionAvailable` booleans on `videoSubtitles` with a single
 *   `mode` enum: "auto" | "keepOriginal" | "translate".
 *   - keepNativeCaptions true            -> "keepOriginal"
 *   - skipWhenTargetCaptionAvailable false -> "translate"
 *   - otherwise                          -> "auto" (use official caption when
 *                                            available, else translate)
 *
 * IMPORTANT: All values are hardcoded inline. Migration scripts are frozen
 * snapshots — never import constants or helpers that may change.
 */

export function migrate(oldConfig: any): any {
  if (!oldConfig || typeof oldConfig !== "object") {
    return oldConfig
  }

  const videoSubtitles = oldConfig.videoSubtitles
  if (!videoSubtitles || typeof videoSubtitles !== "object") {
    return oldConfig
  }

  if (typeof videoSubtitles.mode === "string") {
    return oldConfig
  }

  let mode = "auto"
  if (videoSubtitles.keepNativeCaptions === true) {
    mode = "keepOriginal"
  } else if (videoSubtitles.skipWhenTargetCaptionAvailable === false) {
    mode = "translate"
  }

  const {
    keepNativeCaptions: _keepNativeCaptions,
    skipWhenTargetCaptionAvailable: _skipWhenTargetCaptionAvailable,
    ...restVideoSubtitles
  } = videoSubtitles

  return {
    ...oldConfig,
    videoSubtitles: {
      ...restVideoSubtitles,
      mode,
    },
  }
}
