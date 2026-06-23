import type { SubtitleColorSegment } from "@/utils/subtitles/types"

const CAPTION_VISUAL_LINE_SELECTOR = ".caption-visual-line"
const CAPTION_SEGMENT_SELECTOR = ".ytp-caption-segment"
const WHITESPACE_PATTERN = /\s+/g
const POLL_INTERVAL_MS = 300

export interface NativeCaptionCue {
  /** Plain concatenated text of the cue (translation input). */
  text: string
  /** Colored runs preserving the original caption colors. */
  segments: SubtitleColorSegment[]
}

type NativeCueHandler = (cue: NativeCaptionCue | null) => void

/**
 * Reads YouTube's natively-rendered captions directly from the DOM.
 *
 * This is the reliable fallback used when the timedtext API path fails: instead
 * of re-downloading the transcript (which can fail due to POT tokens), we read
 * the exact text YouTube already shows on screen — including inline colors of
 * styled/colored captions — and report each cue as it appears.
 */
export class YoutubeNativeCaptionReader {
  private started = false
  private container: HTMLElement | null = null
  private containerObserver: MutationObserver | null = null
  private rootObserver: MutationObserver | null = null
  private pollIntervalId: ReturnType<typeof setInterval> | null = null
  private lastText = ""

  constructor(
    private readonly playerContainerSelector: string,
    private readonly nativeSubtitlesSelector: string,
    private readonly onCue: NativeCueHandler,
  ) {}

  start() {
    if (this.started) {
      return
    }
    this.started = true

    this.attachToContainer()

    // The caption container is created lazily and recreated across videos, so
    // watch the player subtree and (re)attach whenever it appears.
    const player = document.querySelector<HTMLElement>(this.playerContainerSelector)
    if (player) {
      this.rootObserver = new MutationObserver(() => this.attachToContainer())
      this.rootObserver.observe(player, { childList: true, subtree: true })
    }

    // Polling safety net: MutationObservers can miss caption updates (attached
    // late, or YouTube updates via a path that doesn't mutate observed nodes).
    // Re-checking the on-screen text on a short interval (deduped) guarantees we
    // always pick up whatever the player is currently showing.
    this.pollIntervalId = setInterval(() => {
      this.attachToContainer()
      this.readCue()
    }, POLL_INTERVAL_MS)
  }

  stop() {
    this.started = false
    this.containerObserver?.disconnect()
    this.containerObserver = null
    this.rootObserver?.disconnect()
    this.rootObserver = null
    if (this.pollIntervalId !== null) {
      clearInterval(this.pollIntervalId)
      this.pollIntervalId = null
    }
    this.container = null
    this.lastText = ""
  }

  private attachToContainer() {
    if (!this.started) {
      return
    }

    const container = document.querySelector<HTMLElement>(this.nativeSubtitlesSelector)

    if (!container) {
      if (this.container) {
        this.containerObserver?.disconnect()
        this.containerObserver = null
        this.container = null
        this.lastText = ""
        this.onCue(null)
      }
      return
    }

    if (container === this.container) {
      return
    }

    this.containerObserver?.disconnect()
    this.container = container
    this.containerObserver = new MutationObserver(() => this.readCue())
    this.containerObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    this.readCue()
  }

  private readCue() {
    const container = this.container
    if (!container) {
      return
    }

    const cue = extractCue(container)
    const text = cue?.text ?? ""
    if (text === this.lastText) {
      return
    }

    this.lastText = text
    this.onCue(cue)
  }
}

function normalize(text: string): string {
  return text.replace(WHITESPACE_PATTERN, " ").trim()
}

function extractCue(container: HTMLElement): NativeCaptionCue | null {
  const lineNodes = Array.from(container.querySelectorAll<HTMLElement>(CAPTION_VISUAL_LINE_SELECTOR))
  const lines = lineNodes.length > 0 ? lineNodes : [container]

  const segments: SubtitleColorSegment[] = []

  lines.forEach((line, lineIndex) => {
    const segmentNodes = Array.from(line.querySelectorAll<HTMLElement>(CAPTION_SEGMENT_SELECTOR))
    const nodes = segmentNodes.length > 0 ? segmentNodes : [line]

    for (const node of nodes) {
      const text = node.textContent ?? ""
      if (!text) {
        continue
      }
      // Only capture an explicit inline color (set on styled/colored captions).
      // Default white captions have no inline color, so the user-configured
      // color is used for them.
      const inlineColor = node.style?.color?.trim()
      segments.push({ text, color: inlineColor || undefined })
    }

    if (lineIndex < lines.length - 1 && segments.length > 0) {
      segments.push({ text: " " })
    }
  })

  const text = normalize(segments.map(seg => seg.text).join(""))
  if (!text) {
    return null
  }

  return { text, segments }
}
