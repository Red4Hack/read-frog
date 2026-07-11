import {
  YOUTUBE_NAVIGATE_FINISH_EVENT,
  YOUTUBE_SUBTITLES_BUTTON_CLASS,
} from "@/utils/constants/subtitles"
import { waitForElement } from "@/utils/dom/wait-for-element"

type CaptionStateChangedHandler = (pressed: boolean) => void

/**
 * Watches YouTube's native CC (subtitles) button and reports its on/off state,
 * so the Read Frog translation can be synced with the player's captions.
 */
class YoutubeCaptionStateListener {
  private started = false
  private bindAttempt = 0
  private observedButton: HTMLElement | null = null
  private buttonObserver: MutationObserver | null = null
  private lastPressed: boolean | null = null

  private readonly buttonSelector: string

  constructor(
    private readonly playerContainerSelector: string,
    private readonly onChange: CaptionStateChangedHandler,
  ) {
    this.buttonSelector = `${playerContainerSelector} ${YOUTUBE_SUBTITLES_BUTTON_CLASS}`
  }

  start() {
    if (this.started) {
      return
    }
    this.started = true
    window.addEventListener(YOUTUBE_NAVIGATE_FINISH_EVENT, this.handleNavigateFinish)
    void this.bind()
  }

  stop() {
    this.started = false
    window.removeEventListener(YOUTUBE_NAVIGATE_FINISH_EVENT, this.handleNavigateFinish)
    this.disconnect()
  }

  private async bind() {
    const attempt = ++this.bindAttempt
    const button = await waitForElement(
      this.buttonSelector,
      (element) => !!element.closest(this.playerContainerSelector),
    )

    if (!this.started || attempt !== this.bindAttempt || !(button instanceof HTMLElement)) {
      return
    }

    if (this.observedButton === button) {
      return
    }

    this.disconnect()
    this.observedButton = button
    this.lastPressed = isPressed(button)

    this.buttonObserver = new MutationObserver(() => this.syncState())
    this.buttonObserver.observe(button, {
      attributes: true,
      attributeFilter: ["aria-pressed"],
    })
  }

  private syncState() {
    const button = this.observedButton
    if (!button) {
      return
    }

    const pressed = isPressed(button)
    if (pressed === this.lastPressed) {
      return
    }

    this.lastPressed = pressed
    this.onChange(pressed)
  }

  private disconnect() {
    this.buttonObserver?.disconnect()
    this.buttonObserver = null
    this.observedButton = null
    this.lastPressed = null
  }

  private handleNavigateFinish = () => {
    this.disconnect()
    void this.bind()
  }
}

export function createYoutubeCaptionStateListener({
  playerContainerSelector,
  onChange,
}: {
  playerContainerSelector: string
  onChange: CaptionStateChangedHandler
}) {
  return new YoutubeCaptionStateListener(playerContainerSelector, onChange)
}

function isPressed(button: HTMLElement): boolean {
  return button.getAttribute("aria-pressed") === "true"
}
