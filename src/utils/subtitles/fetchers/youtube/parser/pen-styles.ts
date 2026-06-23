import type { YoutubeSubtitlesResponse, YoutubeTimedText, YoutubeTimedTextPen } from "../types"

/**
 * Best-effort extraction of a CSS color from a json3 caption "pen" style.
 *
 * YouTube's json3 timedtext format carries per-segment styling via a top-level
 * `pens` table referenced by `seg.pPenId`. The foreground color is stored either
 * as a decimal RGB integer (`fcRgb`) or, in some responses, as a string (`fc`).
 * We only return a color we can confidently build; otherwise undefined so the
 * user-configured color is used.
 *
 * NOTE: the reliable color source is the natively-rendered caption DOM
 * (see native-caption-reader.ts). This API-side parsing is a best-effort path
 * for videos where the timedtext API succeeds; if the field names differ in a
 * given response it simply yields no color instead of a wrong one.
 */
export function penToColor(pen: YoutubeTimedTextPen | undefined): string | undefined {
  if (!pen) {
    return undefined
  }

  const rgbInt = pen.fcRgb
  if (typeof rgbInt === "number" && Number.isFinite(rgbInt) && rgbInt >= 0 && rgbInt <= 0xFFFFFF) {
    return `#${rgbInt.toString(16).padStart(6, "0")}`
  }

  const fc = pen.fc
  if (typeof fc === "string") {
    const normalized = fc.trim()
    if (/^#?[0-9a-f]{6}$/i.test(normalized)) {
      return normalized.startsWith("#") ? normalized : `#${normalized}`
    }
  }

  return undefined
}

/**
 * Resolve per-segment colors from the response's pens table onto each segment as
 * `seg.color`, so downstream parsers can build colored fragments without needing
 * the pens table. Returns the events unchanged when there is no styling info.
 */
export function resolveSegmentColors(response: YoutubeSubtitlesResponse): YoutubeTimedText[] {
  const pens = response.pens
  if (!pens || pens.length === 0) {
    return response.events
  }

  return response.events.map((event) => {
    if (!event.segs) {
      return event
    }

    return {
      ...event,
      segs: event.segs.map((seg) => {
        const penId = seg.pPenId
        if (penId == null) {
          return seg
        }
        const color = penToColor(pens[penId])
        return color ? { ...seg, color } : seg
      }),
    }
  })
}
