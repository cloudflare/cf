import { pathToFileURL } from "node:url";

export function getTypechecker(platform = process.platform) {
	// This tsrs release has no Windows binaries.
	return platform === "win32" ? "@typescript/native-preview" : "tsrs";
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	const compiler = getTypechecker();
	const bin = compiler === "tsrs" ? "tsrs" : "tsgo";
	// Load the package's launcher in this process so it owns exit codes and
	// signals. Arguments and the caller's working directory pass through intact.
	await import(
		new URL(`./bin/${bin}`, import.meta.resolve(`${compiler}/package.json`))
			.href
	);
}
