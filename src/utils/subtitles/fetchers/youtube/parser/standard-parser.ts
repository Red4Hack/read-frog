import type { SubtitlesFragment } from "../../../types"
import type { YoutubeTimedText } from "../types"

const WHITESPACE_PATTERN = /\s+/g

/**
 * Parse standard format subtitles
 */
export function parseStandardSubtitles(events: YoutubeTimedText[] = []): SubtitlesFragment[] {
  const segments: SubtitlesFragment[] = []
  let buffer: SubtitlesFragment | null = null

  events.forEach(({ segs = [], tStartMs, dDurationMs = 0 }) => {
    segs.forEach(({ utf8, tOffsetMs = 0, color }, segIndex) => {
      const text = utf8.trim().replace(WHITESPACE_PATTERN, " ")
      const start = tStartMs + tOffsetMs

      if (buffer) {
        if (!buffer.end || buffer.end > start) {
          buffer.end = start
        }
        segments.push(buffer)
        buffer = null
      }

      buffer = {
        text,
        start,
        end: 0,
      }

      // Preserve a colored caption run so the original line can be rendered
      // with its caption color instead of the configured one.
      if (color && text) {
        buffer.segments = [{ text, color }]
      }

      if (segIndex === segs.length - 1) {
        buffer.end = tStartMs + dDurationMs
      }
    })
  })

  if (buffer) {
    segments.push(buffer)
  }
  return segments
}
