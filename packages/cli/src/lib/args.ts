/**
 * Detect `--quiet` / `-q` directly from argv, before yargs has parsed.
 */
export function hasQuietFlag(argv: string[] = process.argv.slice(2)): boolean {
	let isQuiet = false;

	for (const [index, arg] of argv.entries()) {
		if (arg === "--") {
			break;
		}
		if (arg === "--quiet=false" || arg === "-q=false" || arg === "--no-quiet") {
			isQuiet = false;
			continue;
		}

		if (arg === "--quiet=true" || arg === "-q=true") {
			isQuiet = true;
			continue;
		}

		if (arg === "--quiet" || arg === "-q") {
			isQuiet = argv[index + 1] !== "false";
		}
	}

	return isQuiet;
}
