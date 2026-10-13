/**
 * The entry module of the generator plugin, which the `task:generate:plugin`
 * Vite+ task compiles to `cli.wasm`.
 * The plugin runs without Node or a file system, so cf's hand-written
 * commands and their `meta.ts` sidecars are bundled into it.
 */
import { handWrittenMeta } from "../src/commands/hand-written-meta.js";
import { handWrittenCommands } from "../src/commands/hand-written.js";
import { cliPlugin } from "./plugin/index.js";

export const { generate, generateGroup } = cliPlugin({
	handWritten: handWrittenCommands,
	sidecars: handWrittenMeta,
});
