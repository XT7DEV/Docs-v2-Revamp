import { StarlightConfig } from "./user-config.js";
import { PaginationLinks, SidebarEntry, SidebarGroup, SidebarLink } from "./routing/types.js";
import { PrevNextLinkConfig } from "../schemas/prevNextLink.js";
//#region src/utils/navigation.d.ts
/** Get the sidebar for the current page using the global config. */
declare function getSidebar(pathname: string, locale: string | undefined): SidebarEntry[];
/** Get the sidebar for the current page using the specified sidebar config. */
declare function getSidebarFromConfig(sidebarConfig: StarlightConfig['sidebar'], pathname: string, locale: string | undefined): SidebarEntry[];
/**
 * Check whether a given sidebar group contains a link to the current page (without recomputing the
 * entire sidebar tree for every call).
 *
 * ⚠️ Results are cached per sidebar group so this helper must only be called with a page’s finalised
 * sidebar data when rendering a component.
 *
 * **Do not use in the following cases:**
 *
 * - Directly on the result of `getSidebar()` — this data is re-used across pages and calling
 *   `sidebarGroupHasCurrent()` could result in incorrect cached data from previous pages.
 *
 * - On `locals.starlightRoute.sidebar` before all user mutations of sidebar data have been
 *   completed — this could result in incorrect cached data that does not reflect subsequent changes
 *   to the sidebar.
 */
declare function sidebarGroupHasCurrent(group: SidebarGroup): boolean;
/** Generates a deterministic string based on the content of the passed sidebar. */
declare function getSidebarHash(sidebar: SidebarEntry[]): string;
/** Turn the nested tree structure of a sidebar into a flat list of all the links. */
declare function flattenSidebar(sidebar: SidebarEntry[]): SidebarLink[];
/** Get previous/next pages in the sidebar or the ones from the frontmatter if any. */
declare function getPrevNextLinks(sidebar: SidebarEntry[], paginationEnabled: boolean, config: {
  prev?: PrevNextLinkConfig;
  next?: PrevNextLinkConfig;
}): PaginationLinks;
//#endregion
export { flattenSidebar, getPrevNextLinks, getSidebar, getSidebarFromConfig, getSidebarHash, sidebarGroupHasCurrent };