import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const homeUrl = cfg.baseUrl ? `https://${cfg.baseUrl}` : pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={homeUrl}>
        <svg
          class="page-title-icon"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
        >
          <rect x="2" y="2" width="28" height="28" rx="6" stroke="#cc342d" stroke-width="2" />
          <circle cx="10" cy="10" r="2" fill="#cc342d" />
          <circle cx="22" cy="10" r="2" fill="#cc342d" />
          <circle cx="10" cy="22" r="2" fill="#cc342d" />
          <circle cx="22" cy="22" r="2" fill="#cc342d" />
          <line x1="12" y1="10" x2="20" y2="10" stroke="#cc342d" stroke-width="1.5" />
          <line x1="10" y1="12" x2="10" y2="20" stroke="#cc342d" stroke-width="1.5" />
          <line x1="22" y1="12" x2="22" y2="20" stroke="#cc342d" stroke-width="1.5" />
          <line x1="12" y1="22" x2="20" y2="22" stroke="#cc342d" stroke-width="1.5" />
          <line x1="12" y1="12" x2="20" y2="20" stroke="#cc342d" stroke-width="1.5" opacity="0.4" />
        </svg>
        {title}
      </a>
    </h2>
  )
}

PageTitle.css = `
.page-title {
  font-size: 1.75rem;
  margin: 0;
  font-family: var(--titleFont);
}
.page-title a {
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-title-icon {
  flex-shrink: 0;
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
