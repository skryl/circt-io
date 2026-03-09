import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { FileTrieNode } from "./quartz/util/fileTrie"

const explorerSortFn = (a: FileTrieNode, b: FileTrieNode) => {
  const order: Record<string, number> = {
    docs: 0,
    blog: 1,
    introduction: 0,
    installation: 1,
    basics: 2,
    components: 3,
    architecture: 4,
    simulation: 5,
    synthesis: 6,
    showcase: 7,
  }
  const orderA = order[a.slugSegment]
  const orderB = order[b.slugSegment]
  if (orderA !== undefined && orderB !== undefined) return orderA - orderB
  if (orderA !== undefined) return -1
  if (orderB !== undefined) return 1

  if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
    return a.displayName.localeCompare(b.displayName, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  }
  return a.isFolder ? -1 : 1
}

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "CIRCT Home": "https://circt.io",
      Docs: "https://circt.io/docs/",
      Blog: "https://circt.io/blog/",
      GitHub: "https://github.com/skryl/rhdl",
    },
  }),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.Flex({
      components: [
        { Component: Component.ArticleTitle(), grow: true },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Explorer({ sortFn: explorerSortFn }),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.Flex({
      components: [
        { Component: Component.ArticleTitle(), grow: true },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.ContentMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Explorer({ sortFn: explorerSortFn }),
  ],
  right: [],
}
