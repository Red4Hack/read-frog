import { deepmerge } from "deepmerge-ts"
import { useAtom } from "jotai"
import { HelpTooltip } from "@/components/help-tooltip"
import { Field, FieldContent, FieldLabel } from "@/components/ui/base-ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base-ui/select"
import { Switch } from "@/components/ui/base-ui/switch"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { i18n } from "@/utils/i18n"
import { ConfigCard } from "../../components/config-card"

export function SubtitlesConfig() {
  const [videoSubtitlesConfig, setVideoSubtitlesConfig] = useAtom(
    configFieldsAtomMap.videoSubtitles,
  )

  return (
    <ConfigCard
      id="subtitles-config"
      title={i18n.t("options.videoSubtitles.title")}
      description={i18n.t("options.videoSubtitles.description")}
    >
      <div className="space-y-6">
        <Field orientation="horizontal">
          <FieldContent className="self-center">
            <FieldLabel htmlFor="video-subtitles-toggle">
              {i18n.t("options.videoSubtitles.enable")}
              <HelpTooltip>{i18n.t("options.videoSubtitles.enableDescription")}</HelpTooltip>
            </FieldLabel>
          </FieldContent>
          <Switch
            id="video-subtitles-toggle"
            checked={videoSubtitlesConfig?.enabled ?? false}
            onCheckedChange={(checked) => {
              void setVideoSubtitlesConfig(
                deepmerge(videoSubtitlesConfig, {
                  enabled: checked,
                }),
              )
            }}
          />
        </Field>

        <Field orientation="horizontal">
          <FieldContent className="self-center">
            <FieldLabel htmlFor="video-subtitles-autostart">
              {i18n.t("options.videoSubtitles.autoStart")}
              <HelpTooltip>{i18n.t("options.videoSubtitles.autoStartDescription")}</HelpTooltip>
            </FieldLabel>
          </FieldContent>
          <Switch
            id="video-subtitles-autostart"
            checked={videoSubtitlesConfig?.autoStart ?? false}
            onCheckedChange={(checked) => {
              void setVideoSubtitlesConfig(
                deepmerge(videoSubtitlesConfig, {
                  autoStart: checked,
                }),
              )
            }}
          />
        </Field>

        <Field orientation="horizontal">
          <FieldContent className="self-center">
            <FieldLabel htmlFor="video-subtitles-preserve-caption-colors">
              {i18n.t("options.videoSubtitles.preserveCaptionColors")}
              <HelpTooltip>
                {i18n.t("options.videoSubtitles.preserveCaptionColorsDescription")}
              </HelpTooltip>
            </FieldLabel>
          </FieldContent>
          <Switch
            id="video-subtitles-preserve-caption-colors"
            checked={videoSubtitlesConfig?.preserveCaptionColors ?? true}
            onCheckedChange={(checked) => {
              void setVideoSubtitlesConfig(
                deepmerge(videoSubtitlesConfig, {
                  preserveCaptionColors: checked,
                }),
              )
            }}
          />
        </Field>

        <Field orientation="horizontal">
          <FieldContent className="self-center">
            <FieldLabel htmlFor="video-subtitles-mode">
              {i18n.t("options.videoSubtitles.mode.title")}
              <HelpTooltip>{i18n.t("options.videoSubtitles.mode.description")}</HelpTooltip>
            </FieldLabel>
          </FieldContent>
          <Select
            value={videoSubtitlesConfig?.mode ?? "auto"}
            onValueChange={(value) => {
              if (!value) return
              void setVideoSubtitlesConfig(
                deepmerge(videoSubtitlesConfig, {
                  mode: value,
                }),
              )
            }}
          >
            <SelectTrigger id="video-subtitles-mode" className="h-8 w-auto">
              <SelectValue>
                {i18n.t(`options.videoSubtitles.mode.${videoSubtitlesConfig?.mode ?? "auto"}`)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="auto">{i18n.t("options.videoSubtitles.mode.auto")}</SelectItem>
                <SelectItem value="keepOriginal">
                  {i18n.t("options.videoSubtitles.mode.keepOriginal")}
                </SelectItem>
                <SelectItem value="translate">
                  {i18n.t("options.videoSubtitles.mode.translate")}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field orientation="horizontal">
          <FieldContent className="self-center">
            <FieldLabel htmlFor="video-subtitles-ai-segmentation">
              {i18n.t("options.videoSubtitles.aiSegmentation.enable")}
              <HelpTooltip>
                {i18n.t("options.videoSubtitles.aiSegmentation.enableDescription")}
              </HelpTooltip>
            </FieldLabel>
          </FieldContent>
          <Switch
            id="video-subtitles-ai-segmentation"
            checked={videoSubtitlesConfig?.aiSegmentation ?? false}
            onCheckedChange={(checked) => {
              void setVideoSubtitlesConfig(
                deepmerge(videoSubtitlesConfig, {
                  aiSegmentation: checked,
                }),
              )
            }}
          />
        </Field>
      </div>
    </ConfigCard>
  )
}
