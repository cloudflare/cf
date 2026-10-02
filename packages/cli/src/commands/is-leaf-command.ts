import { isCommandsMetadata, loadMeta } from "../lib/metadata.js";

/** Whether this command can accept positional values after its name. */
export function isLeafCommand(command: string): boolean {
	const metadata = loadMeta(
		import.meta.url,
		"commands.json",
		isCommandsMetadata
	);
	// If generated metadata is unavailable, leave yargs' normal help behavior.
	return (
		metadata?.commands.some((entry) => entry.command === `cf ${command}`) ??
		true
	);
}
