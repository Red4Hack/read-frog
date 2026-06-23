/**
 * Migration script from v086 to v087
 * - Adds `keepNativeCaptions` (default false) to `videoSubtitles`. When enabled,
 *   the extension keeps YouTube's native captions visible (with their original
 *   position and color) and shows only the translation below them.
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

  if (typeof videoSubtitles.keepNativeCaptions === "boolean") {
    return oldConfig
  }

  return {
    ...oldConfig,
    videoSubtitles: {
      ...videoSubtitles,
      keepNativeCaptions: false,
    },
  }
}
