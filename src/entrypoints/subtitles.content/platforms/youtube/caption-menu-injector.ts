import { YOUTUBE_NAVIGATE_FINISH_EVENT } from "@/utils/constants/subtitles"
import { waitForElement } from "@/utils/dom/wait-for-element"

const SETTINGS_BUTTON_SELECTOR = ".ytp-settings-button"
const SETTINGS_MENU_SELECTOR = ".ytp-settings-menu"
const PANEL_SELECTOR = ".ytp-panel"
const PANEL_MENU_SELECTOR = ".ytp-panel-menu"
// Only the captions sub-panel has an "Options" link in its header — quality and
// speed sub-panels do not. This is a locale-independent way to detect it.
const PANEL_OPTIONS_SELECTOR = ".ytp-panel-options"
const RADIO_ITEM_SELECTOR = ".ytp-menuitem[role=\"menuitemradio\"]"
const MENU_ITEM_LABEL_SELECTOR = ".ytp-menuitem-label"
export const CAPTION_MODE_SUFFIX_CLASS = "read-frog-caption-mode-suffix"

export interface YoutubeCaptionMenuInjectorOptions {
  playerContainerSelector: string
  /**
   * Returns the suffix to append to the selected caption track when Read Frog
   * translation is active (e.g. "-Bilingual"), or null when it is off.
   */
  getModeSuffix: () => string | null
}

/**
 * Best-effort integration with YouTube's captions submenu: instead of adding a
 * separate row, it decorates the currently selected caption track's label with
 * the Read Frog display mode (e.g. "English (auto-generated)-Bilingual") so the
 * user can see that Read Frog is translating that track, right in the
 * Subtitles/CC language list.
 *
 * Degrades gracefully — if YouTube changes its menu markup, the in-player Read
 * Frog button and the CC-button sync keep working.
 */
class YoutubeCaptionMenuInjector {
  private started = false
  private bindAttempt = 0
  private observedButton: HTMLElement | null = null
  private buttonObserver: MutationObserver | null = null
  private menuObserver: MutationObserver | null = null
  private observedMenu: HTMLElement | null = null
  private rafId: number | null = null

  private readonly settingsButtonSelector: string

  constructor(
    private readonly playerContainerSelector: string,
    private readonly getModeSuffix: () => string | null,
  ) {
    this.settingsButtonSelector = `${playerContainerSelector} ${SETTINGS_BUTTON_SELECTOR}`
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
      this.settingsButtonSelector,
      element => !!element.closest(this.playerContainerSelector),
    )

    if (!this.started || attempt !== this.bindAttempt || !(button instanceof HTMLElement)) {
      return
    }

    if (this.observedButton === button) {
      return
    }

    this.disconnect()
    this.observedButton = button
    this.buttonObserver = new MutationObserver(() => this.syncMenuObserver())
    this.buttonObserver.observe(button, {
      attributes: true,
      attributeFilter: ["aria-expanded"],
    })
    this.syncMenuObserver()
  }

  /**
   * Observe the settings menu subtree only while it is open. Submenu navigation
   * keeps the settings button expanded, so we watch the subtree for the captions
   * panel appearing rather than relying on the button state alone.
   */
  private syncMenuObserver() {
    const button = this.observedButton
    const isOpen = button?.getAttribute("aria-expanded") === "true"

    if (!isOpen) {
      this.disconnectMenuObserver()
      return
    }

    const menu = this.getSettingsMenu()
    if (!menu) {
      return
    }

    if (this.observedMenu !== menu) {
      this.disconnectMenuObserver()
      this.observedMenu = menu
      this.menuObserver = new MutationObserver(() => this.scheduleEnsure())
      this.menuObserver.observe(menu, { childList: true, subtree: true })
    }

    this.scheduleEnsure()
  }

  private scheduleEnsure() {
    if (this.rafId !== null) {
      return
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null
      this.decorateCaptionsMenu()
    })
  }

  private decorateCaptionsMenu() {
    const menu = this.getSettingsMenu()
    if (!menu) {
      return
    }

    const optionsLink = menu.querySelector<HTMLElement>(PANEL_OPTIONS_SELECTOR)
    if (!optionsLink) {
      // Captions submenu is not the currently rendered panel.
      return
    }

    const panel = optionsLink.closest<HTMLElement>(PANEL_SELECTOR)
    const panelMenu = panel?.querySelector<HTMLElement>(PANEL_MENU_SELECTOR)
    if (!panelMenu) {
      return
    }

    const suffix = this.getModeSuffix()
    const items = panelMenu.querySelectorAll<HTMLElement>(RADIO_ITEM_SELECTOR)

    items.forEach((item) => {
      const label = item.querySelector<HTMLElement>(MENU_ITEM_LABEL_SELECTOR)
      if (!label) {
        return
      }

      const isSelected = item.getAttribute("aria-checked") === "true"
      const shouldShow = isSelected && !!suffix
      let badge = label.querySelector<HTMLElement>(`.${CAPTION_MODE_SUFFIX_CLASS}`)

      if (shouldShow) {
        if (!badge) {
          badge = document.createElement("span")
          badge.className = CAPTION_MODE_SUFFIX_CLASS
          label.appendChild(badge)
        }
        if (badge.textContent !== suffix) {
          badge.textContent = suffix
        }
      }
      else if (badge) {
        badge.remove()
      }
    })
  }

  private getSettingsMenu(): HTMLElement | null {
    const player = this.observedButton?.closest<HTMLElement>(this.playerContainerSelector)
    return player?.querySelector<HTMLElement>(SETTINGS_MENU_SELECTOR) ?? null
  }

  private disconnectMenuObserver() {
    this.menuObserver?.disconnect()
    this.menuObserver = null
    this.observedMenu = null
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private disconnect() {
    this.buttonObserver?.disconnect()
    this.buttonObserver = null
    this.observedButton = null
    this.disconnectMenuObserver()
  }

  private handleNavigateFinish = () => {
    this.disconnect()
    void this.bind()
  }
}

export function createYoutubeCaptionMenuInjector({
  playerContainerSelector,
  getModeSuffix,
}: YoutubeCaptionMenuInjectorOptions) {
  return new YoutubeCaptionMenuInjector(playerContainerSelector, getModeSuffix)
}
