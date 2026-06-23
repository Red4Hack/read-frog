import type { NativeCaptionCue } from "./platforms/youtube/native-caption-reader"
import type { SubtitlesVideoContext } from "@/utils/subtitles/processor/translator"
import type { SubtitlesFragment } from "@/utils/subtitles/types"
import { translateSubtitles } from "@/utils/subtitles/processor/translator"
import { currentSubtitleAtom, subtitlesStore } from "./atoms"
import { YoutubeNativeCaptionReader } from "./platforms/youtube/native-caption-reader"

const LIVE_CUE_END = Number.MAX_SAFE_INTEGER

export interface NativeLiveControllerOptions {
  playerContainerSelector: string
  nativeSubtitlesSelector: string
  videoContext: SubtitlesVideoContext
  /** When false (source language === target), show the original text as-is. */
  shouldTranslate: boolean
}

/**
 * Live fallback runtime: drives the subtitle overlay directly from YouTube's
 * natively-rendered captions. Each cue is shown immediately (original text +
 * colors) and its translation is filled in asynchronously. Used when the
 * timedtext API path cannot produce a transcript.
 */
export class NativeLiveController {
  private reader: YoutubeNativeCaptionReader
  private seq = 0
  private translationCache = new Map<string, string>()
  private readonly options: NativeLiveControllerOptions

  constructor(options: NativeLiveControllerOptions) {
    this.options = options
    this.reader = new YoutubeNativeCaptionReader(
      options.playerContainerSelector,
      options.nativeSubtitlesSelector,
      cue => this.handleCue(cue),
    )
  }

  start() {
    this.reader.start()
  }

  stop() {
    this.seq++
    this.reader.stop()
    this.translationCache.clear()
    subtitlesStore.set(currentSubtitleAtom, null)
  }

  private handleCue(cue: NativeCaptionCue | null) {
    const mySeq = ++this.seq

    if (!cue) {
      subtitlesStore.set(currentSubtitleAtom, null)
      return
    }

    const baseFragment: SubtitlesFragment = {
      text: cue.text,
      start: 0,
      end: LIVE_CUE_END,
      segments: cue.segments,
    }

    if (!this.options.shouldTranslate) {
      subtitlesStore.set(currentSubtitleAtom, { ...baseFragment, translation: cue.text })
      return
    }

    const cached = this.translationCache.get(cue.text)
    // Show the original immediately; translation (cached or pending) fills in.
    subtitlesStore.set(currentSubtitleAtom, cached !== undefined
      ? { ...baseFragment, translation: cached }
      : baseFragment)

    if (cached !== undefined) {
      return
    }

    void translateSubtitles([{ ...baseFragment }], this.options.videoContext)
      .then((translated) => {
        const translation = translated[0]?.translation ?? ""
        this.translationCache.set(cue.text, translation)
        // Ignore if a newer cue has since arrived.
        if (mySeq !== this.seq) {
          return
        }
        subtitlesStore.set(currentSubtitleAtom, { ...baseFragment, translation })
      })
      .catch(() => {
        // Keep the original text visible on translation failure.
      })
  }
}
