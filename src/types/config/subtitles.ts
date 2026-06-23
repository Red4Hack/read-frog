import { z } from "zod"
import {
  MAX_BACKGROUND_OPACITY,
  MAX_FONT_SCALE,
  MAX_FONT_WEIGHT,
  MIN_BACKGROUND_OPACITY,
  MIN_FONT_SCALE,
  MIN_FONT_WEIGHT,
} from "@/utils/constants/subtitles"
import {
  batchQueueConfigSchema,
  customPromptsConfigSchema,
  requestQueueConfigSchema,
} from "./translate"

export const subtitlesDisplayModeSchema = z.enum(["bilingual", "originalOnly", "translationOnly"])
export const subtitlesTranslationPositionSchema = z.enum(["above", "below"])
export const subtitlesFontFamilySchema = z.enum(["system", "roboto", "noto-sans", "noto-serif"])

/**
 * How Read Frog handles a video's captions:
 * - "auto": use the video's ready (human) caption in your language when it
 *   exists; otherwise translate (replacing the native captions).
 * - "keepOriginal": keep the original captions in place (position + color) and
 *   show the translation below them (good for styled/positioned captions).
 * - "translate": always translate and replace the native captions, even when an
 *   official caption already exists.
 */
export const videoSubtitlesModeSchema = z.enum(["auto", "keepOriginal", "translate"])

export const subtitleTextStyleSchema = z.object({
  fontFamily: subtitlesFontFamilySchema,
  fontScale: z.number().min(MIN_FONT_SCALE).max(MAX_FONT_SCALE),
  color: z.string(),
  fontWeight: z.number().min(MIN_FONT_WEIGHT).max(MAX_FONT_WEIGHT),
})

export const subtitleContainerStyleSchema = z.object({
  backgroundOpacity: z.number().min(MIN_BACKGROUND_OPACITY).max(MAX_BACKGROUND_OPACITY),
})

export const subtitlesStyleSchema = z.object({
  displayMode: subtitlesDisplayModeSchema,
  translationPosition: subtitlesTranslationPositionSchema,
  main: subtitleTextStyleSchema,
  translation: subtitleTextStyleSchema,
  container: subtitleContainerStyleSchema,
})

export const subtitlePositionSchema = z.object({
  percent: z.number().min(0).max(100),
  anchor: z.enum(["top", "bottom"]),
})

export const videoSubtitlesSchema = z.object({
  enabled: z.boolean(),
  autoStart: z.boolean(),
  preserveCaptionColors: z.boolean(),
  mode: videoSubtitlesModeSchema,
  providerId: z.string().nonempty(),
  style: subtitlesStyleSchema,
  aiSegmentation: z.boolean(),
  requestQueueConfig: requestQueueConfigSchema,
  batchQueueConfig: batchQueueConfigSchema,
  customPromptsConfig: customPromptsConfigSchema,
  position: subtitlePositionSchema,
})

export type SubtitlesDisplayMode = z.infer<typeof subtitlesDisplayModeSchema>
export type VideoSubtitlesMode = z.infer<typeof videoSubtitlesModeSchema>
export type SubtitlesTranslationPosition = z.infer<typeof subtitlesTranslationPositionSchema>
export type SubtitlesFontFamily = z.infer<typeof subtitlesFontFamilySchema>
export type SubtitleTextStyle = z.infer<typeof subtitleTextStyleSchema>
export type SubtitleContainerStyle = z.infer<typeof subtitleContainerStyleSchema>
export type SubtitlesStyle = z.infer<typeof subtitlesStyleSchema>
export type SubtitlePosition = z.infer<typeof subtitlePositionSchema>
export type VideoSubtitles = z.infer<typeof videoSubtitlesSchema>
