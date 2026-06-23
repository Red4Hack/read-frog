/**
 * Migration script from v085 to v086
 * - Adds `preserveCaptionColors` (default true) to `videoSubtitles` so that
 *   colored/styled original captions keep their colors by default.
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

  if (typeof videoSubtitles.preserveCaptionColors === "boolean") {
    return oldConfig
  }

  return {
    ...oldConfig,
    videoSubtitles: {
      ...videoSubtitles,
      preserveCaptionColors: true,
    },
  }
}
