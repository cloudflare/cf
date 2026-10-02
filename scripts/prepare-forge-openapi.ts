#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const forgeDir = process.argv[2];
if (!forgeDir) {
	throw new Error("Expected a Forge checkout directory");
}

const compatibilityModulePath = join(
	forgeDir,
	"packages/forge/shared/fern-openapi-compat.ts"
);
const compatibilityModule = (await import(
	pathToFileURL(compatibilityModulePath).href
)) as {
	applyFernCompatibilityFixes?: (openapi: object) => unknown;
};
const applyFernCompatibilityFixes =
	compatibilityModule.applyFernCompatibilityFixes;
if (typeof applyFernCompatibilityFixes !== "function") {
	throw new Error(
		`Forge checkout has no applyFernCompatibilityFixes export at ${compatibilityModulePath}`
	);
}

const source = JSON.parse(
	readFileSync(join(forgeDir, "openapi.json"), "utf8")
) as object;
const fixes = applyFernCompatibilityFixes(source);
const fernSpecPath = join(
	forgeDir,
	"packages/cloudflare-fern-config/fern/openapi.json"
);
mkdirSync(dirname(fernSpecPath), { recursive: true });
writeFileSync(fernSpecPath, `${JSON.stringify(source, null, 2)}\n`);
console.log(`Prepared Forge OpenAPI build inputs (${JSON.stringify(fixes)}).`);
