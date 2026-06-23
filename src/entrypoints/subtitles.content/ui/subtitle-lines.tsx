import type { SubtitleTextStyle } from "@/types/config/subtitles"
import { useAtomValue } from "jotai"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { SUBTITLE_FONT_FAMILIES } from "@/utils/constants/subtitles"
import { getLanguageDirectionAndLang } from "@/utils/content/language-direction"
import { cn } from "@/utils/styles/utils"
import { currentSubtitleAtom } from "../atoms"

interface SubtitleLineProps {
  content?: string
  className?: string
}

function getTextStyles(textStyle: SubtitleTextStyle) {
  return {
    fontFamily: SUBTITLE_FONT_FAMILIES[textStyle.fontFamily] || SUBTITLE_FONT_FAMILIES.system,
    fontSize: `${textStyle.fontScale / 100}em`,
    color: textStyle.color,
    fontWeight: textStyle.fontWeight,
  }
}

export function MainSubtitle({ content, className }: SubtitleLineProps) {
  const subtitle = useAtomValue(currentSubtitleAtom)
  const { style, preserveCaptionColors } = useAtomValue(configFieldsAtomMap.videoSubtitles)
  const text = content ?? subtitle?.text ?? ""

  // Render the original line span-by-span when the caption carries colored runs
  // and the user opted to keep them. Falls back to the configured color.
  const colorSegments = content == null && preserveCaptionColors ? subtitle?.segments : undefined
  const coloredSpans = colorSegments && colorSegments.some(seg => !!seg.color)
    ? buildColoredSpans(colorSegments)
    : null

  return (
    <div
      className={cn("subtitles-main text-xl leading-tight", className)}
      style={getTextStyles(style.main)}
    >
      {coloredSpans ?? text}
    </div>
  )
}

function buildColoredSpans(segments: { text: string, color?: string }[]) {
  let offset = 0
  return segments.map((seg) => {
    // Stable key from the running character offset (avoids array-index keys).
    const key = `${offset}:${seg.text}`
    offset += seg.text.length
    return (
      <span key={key} style={seg.color ? { color: seg.color } : undefined}>
        {seg.text}
      </span>
    )
  })
}

export function TranslationSubtitle({ content, className }: SubtitleLineProps) {
  const subtitle = useAtomValue(currentSubtitleAtom)
  const { style } = useAtomValue(configFieldsAtomMap.videoSubtitles)
  const language = useAtomValue(configFieldsAtomMap.language)
  const text = content ?? subtitle?.translation ?? ""
  const { dir, lang } = getLanguageDirectionAndLang(language.targetCode)

  return (
    <div
      className={cn("subtitles-translation text-xl leading-tight", className)}
      style={getTextStyles(style.translation)}
      dir={dir}
      lang={lang}
    >
      {text}
    </div>
  )
}
