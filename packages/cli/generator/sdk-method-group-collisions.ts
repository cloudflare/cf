import { readdirSync, readFileSync, writeFileSync, type Dirent } from "node:fs";
import { join, relative, sep } from "node:path";

interface SdkMapEntry {
	accessor?: unknown;
}

export interface SdkMethodGroupCollisionResult {
	collisions: number;
	droppedOperationIds: string[];
}

function walkClientFiles(dir: string): string[] {
	let entries: Dirent[];
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		return [];
	}

	return entries.flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return walkClientFiles(path);
		return entry.name === "Client.ts" ? [path] : [];
	});
}

function accessorForClient(
	generatedSdkDir: string,
	clientFile: string
): string[] {
	const parts = relative(generatedSdkDir, clientFile).split(sep);
	const accessor: string[] = [];
	for (let index = 0; index < parts.length - 1; index++) {
		const resourceName = parts[index + 1];
		if (parts[index] === "resources" && resourceName !== undefined) {
			accessor.push(resourceName);
		}
	}
	return accessor;
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Fern can emit an invalid TypeScript client when an SDK method has the same
 * name as a nested resource. Prefer the callable method and remove the
 * resource accessor; callers cannot use both through one JavaScript property.
 */
export function dropSdkMethodGroupCollisions(
	generatedSdkDir: string
): SdkMethodGroupCollisionResult {
	const droppedAccessors: string[][] = [];

	for (const clientFile of walkClientFiles(generatedSdkDir)) {
		const originalSource = readFileSync(clientFile, "utf8");
		let source = originalSource;
		const imports = [
			...source.matchAll(
				/^import \{ (\w+Client) \} from "\.\.\/resources\/([^"/]+)\/client\/Client\.js";\n/gm
			),
		];

		for (const match of imports) {
			const [importLine, clientClass, resourceName] = match;
			if (!clientClass || !resourceName) continue;
			const escapedClass = escapeRegExp(clientClass);
			const escapedName = escapeRegExp(resourceName);
			const hasMethod = new RegExp(`^    public ${escapedName}\\(`, "m").test(
				source
			);
			const getterPattern = new RegExp(
				`\\n    public get ${escapedName}\\(\\): ${escapedClass} \\{\\n        return \\(this\\._${escapedName} \\?\\?= new ${escapedClass}\\(this\\._options\\)\\);\\n    \\}\\n`
			);
			if (!hasMethod || !getterPattern.test(source)) continue;

			source = source.replace(importLine, "");
			source = source.replace(
				new RegExp(
					`^    protected _${escapedName}: ${escapedClass} \\| undefined;\\n`,
					"m"
				),
				""
			);
			source = source.replace(getterPattern, "");
			droppedAccessors.push([
				...accessorForClient(generatedSdkDir, clientFile),
				resourceName,
			]);
		}

		if (source !== originalSource) writeFileSync(clientFile, source);
	}

	if (droppedAccessors.length === 0) {
		return { collisions: 0, droppedOperationIds: [] };
	}

	const sdkMapPath = join(generatedSdkDir, "sdk-map.json");
	const sdkMap = JSON.parse(readFileSync(sdkMapPath, "utf8")) as Record<
		string,
		SdkMapEntry
	>;
	const droppedOperationIds: string[] = [];
	for (const [operationId, entry] of Object.entries(sdkMap)) {
		if (!Array.isArray(entry.accessor)) continue;
		const accessor = entry.accessor;
		if (
			droppedAccessors.some(
				(prefix) =>
					prefix.length <= accessor.length &&
					prefix.every((part, index) => accessor[index] === part)
			)
		) {
			delete sdkMap[operationId];
			droppedOperationIds.push(operationId);
		}
	}
	writeFileSync(sdkMapPath, `${JSON.stringify(sdkMap, null, 2)}\n`);

	const operationTypesPath = join(generatedSdkDir, "sdk-operation-types.ts");
	const droppedTypePrefixes = new Set(
		droppedOperationIds.map(
			(operationId) => `  ${JSON.stringify(operationId)}:`
		)
	);
	const operationTypes = readFileSync(operationTypesPath, "utf8")
		.split("\n")
		.filter(
			(line) =>
				![...droppedTypePrefixes].some((prefix) => line.startsWith(prefix))
		)
		.join("\n");
	writeFileSync(operationTypesPath, operationTypes);

	return {
		collisions: droppedAccessors.length,
		droppedOperationIds: droppedOperationIds.sort(),
	};
}
