import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "RHDL Blog",
    pageTitleSuffix: " | RHDL",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "skryl.github.io/circt-io/blog",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "JetBrains Mono",
        body: "Inter",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#f0f4f0",
          lightgray: "#d4ddd4",
          gray: "#5a6e52",
          darkgray: "#2a3a24",
          dark: "#0a0e0a",
          secondary: "#cc342d",
          tertiary: "#5a9a5a",
          highlight: "rgba(58, 106, 58, 0.1)",
          textHighlight: "rgba(204, 52, 45, 0.15)",
        },
        darkMode: {
          light: "#0a0e0a",
          lightgray: "#1a2a1a",
          gray: "#5a6e52",
          darkgray: "#b8c4b0",
          dark: "#d0d8c8",
          secondary: "#cc342d",
          tertiary: "#5a9a5a",
          highlight: "rgba(58, 106, 58, 0.12)",
          textHighlight: "rgba(204, 52, 45, 0.2)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
