import { StarlightIcon } from "../components-internals/Icons.js";
//#region src/user-components/file-tree-processor.d.ts
/**
 * Process the HTML for a file tree to create the necessary markup for each file and directory
 * including icons.
 * @param html Inner HTML passed to the `<FileTree>` component.
 * @param directoryLabel The localized label for a directory.
 * @returns The processed HTML for the file tree.
 */
declare function processFileTree(html: string, directoryLabel: string): string;
/**
 * Icon names default to `StarlightIcon` so that generated definitions can be type-checked against
 * available icons. The `file-icons-generator` package uses `string` while generating them from
 * Seti UI.
 */
interface Definitions<T extends string = StarlightIcon> {
  files: Record<string, T>;
  extensions: Record<string, T>;
  partials: Record<string, T>;
}
//#endregion
export { Definitions, processFileTree };