import { describe, expect, it } from "vite-plus/test";
import { getTelemetrySafeFlags } from "../../../generator/telemetry.js";
import type { ArgIR } from "../../../generator/intermediate-representation.js";

function arg(
	name: string,
	type: ArgIR["type"],
	options: { positional?: boolean; secret?: boolean } = {}
): ArgIR {
	return {
		name,
		description: `${name} description`,
		type,
		required: false,
		positional: options.positional ?? false,
		...(options.secret ? { secret: true } : {}),
		origin: { kind: "body", apiFieldPath: [name] },
		isZone: false,
		isWorkerName: false,
	};
}

describe("getTelemetrySafeFlags", () => {
	it("excludes sensitive boolean and enum fields", () => {
		expect(
			getTelemetrySafeFlags([
				arg("public-boolean", "boolean"),
				arg("public-enum", "enum"),
				arg("sortBy", "enum"),
				arg("secret-boolean", "boolean", { secret: true }),
				arg("secret-enum", "enum", { secret: true }),
				arg("positional-boolean", "boolean", { positional: true }),
				arg("free-form", "string"),
			])
		).toEqual(["public-boolean", "public-enum", "sort-by", "dry-run"]);
	});

	it("includes generator-owned boolean flags", () => {
		expect(getTelemetrySafeFlags([], { includeGeneratedForce: true })).toEqual([
			"dry-run",
			"force",
		]);
		expect(getTelemetrySafeFlags([], { includeGeneratedText: true })).toEqual([
			"dry-run",
			"text",
		]);
	});
});
