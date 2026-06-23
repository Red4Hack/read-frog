/**
 * Migration script from v087 to v088
 * - Adds `skipWhenTargetCaptionAvailable` (default true) to `videoSubtitles`.
 *   When enabled, Read Frog does not translate if the video already offers a
 *   ready (human) caption track in the user's target language.
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

  if (typeof videoSubtitles.skipWhenTargetCaptionAvailable === "boolean") {
    return oldConfig
  }

  return {
    ...oldConfig,
    videoSubtitles: {
      ...videoSubtitles,
      skipWhenTargetCaptionAvailable: true,
    },
  }
}
