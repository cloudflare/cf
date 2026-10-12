import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { transformSync } from "esbuild";

function clientFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		return entry.isDirectory()
			? clientFiles(path)
			: entry.name === "Client.ts"
				? [path]
				: [];
	});
}

/** Keep Fern's type namespace separate from its runtime error constructors. */
export function narrowSdkClientErrorImports(
	source: string,
	errorNames: ReadonlySet<string>
): string {
	const namespaceImport =
		/^import \* as CloudflareApi from "([^"]+\/index\.js)";$/m.exec(source);
	if (!namespaceImport) return source;
	const apiPath = namespaceImport[1];
	if (!apiPath) return source;

	// Examine emitted JS so type references and JSDoc cannot keep the barrel
	// alive. Leave unfamiliar runtime uses alone rather than guessing.
	const runtime = transformSync(source, {
		loader: "ts",
		format: "esm",
		minifyWhitespace: true,
		legalComments: "none",
	}).code;
	const references = [...runtime.matchAll(/\bCloudflareApi\.([\w$]+)/g)];
	const constructors = [...runtime.matchAll(/\bnew CloudflareApi\.([\w$]+)/g)];
	const strings =
		runtime.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g) ??
		[];
	if (
		strings.some((value) => /\bCloudflareApi\b/.test(value)) ||
		references.length !== constructors.length ||
		constructors.some((match) => !errorNames.has(match[1] ?? "")) ||
		/\bCloudflareApi\b/.test(
			runtime
				.replace(/\bimport\s*\*\s*as\s+CloudflareApi\s+from\s*"[^"]+";/, "")
				.replace(/\bnew CloudflareApi\.([\w$]+)/g, "new Error")
		)
	) {
		return source;
	}

	const errorsPath = apiPath.replace(/index\.js$/, "errors/index.js");
	const imports =
		`import type * as CloudflareApi from "${apiPath}";` +
		(constructors.length > 0
			? `\nimport * as CloudflareApiErrors from "${errorsPath}";`
			: "");
	return source
		.replace(namespaceImport[0], imports)
		.replace(/\bnew CloudflareApi\.([\w$]+)/g, (match, name: string) =>
			errorNames.has(name)
				? match.replace("CloudflareApi.", "CloudflareApiErrors.")
				: match
		);
}

/** Applied to both committed and freshly generated SDKs by pnpm generate. */
export function narrowSdkErrorImports(generatedSdkDir: string): number {
	const errorsDir = join(generatedSdkDir, "api/errors");
	const errorNames = new Set(
		readdirSync(errorsDir)
			.filter((name) => name.endsWith("Error.ts"))
			.map((name) => name.slice(0, -3))
	);
	let updated = 0;
	for (const path of clientFiles(generatedSdkDir)) {
		const source = readFileSync(path, "utf8");
		const narrowed = narrowSdkClientErrorImports(source, errorNames);
		if (source === narrowed) continue;
		writeFileSync(path, narrowed);
		updated++;
	}
	return updated;
}
