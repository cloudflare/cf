import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
	__resetCommandVocabularyForTests,
	loadCommandVocabulary,
	MAX_UNKNOWN_TOKENS,
	sanitizeCommandResolution,
	sanitizeCommandToken,
} from "../../../lib/telemetry/command-resolution.js";
import type * as MetadataModule from "../../../lib/metadata.js";
import type { CommandResolutionFailure } from "../../../lib/telemetry/types.js";

const { actualLoadMeta, loadMeta } = vi.hoisted(() => ({
	actualLoadMeta: {
		current: undefined as typeof MetadataModule.loadMeta | undefined,
	},
	loadMeta: vi.fn<typeof MetadataModule.loadMeta>(),
}));

vi.mock("../../../lib/metadata.js", async (importOriginal) => {
	const actual = await importOriginal<typeof MetadataModule>();
	actualLoadMeta.current = actual.loadMeta;
	loadMeta.mockImplementation(actual.loadMeta);
	return { ...actual, loadMeta };
});

const commands = new Set(["zones", "list", "kv", "namespaces", "workers"]);
const vocabulary = {
	commands,
	options: new Set(["zone", "zone-id", "dry-run", "help"]),
};

function failure(
	overrides: Partial<CommandResolutionFailure> = {}
): CommandResolutionFailure {
	return {
		kind: "unknown-subcommand",
		knownCommand: [],
		knownCommandIsLeaf: false,
		unknownTokens: [],
		...overrides,
	};
}

describe("sanitizeCommandToken", () => {
	it.each([
		{ token: "zones", expected: "zones" },
		{ token: "Zones", expected: "zones" },
		{ token: "kv:namespaces", expected: "kv:namespaces" },
		{ token: "kv:namespace", expected: "<colon>" },
		{ token: "zones list", expected: "<spaced>" },
		{ token: "https://example.com/a", expected: "<url>" },
		{ token: "user@example.com", expected: "<email>" },
		{ token: "./a/b", expected: "<path>" },
		{ token: "a/b", expected: "<path>" },
		{ token: "~", expected: "<path>" },
		{ token: ".env", expected: "<path>" },
		{ token: "C:\\Users\\name", expected: "<path>" },
		{ token: "C:", expected: "<path>" },
		{ token: "123e4567-e89b-12d3-a456-426614174000", expected: "<uuid>" },
		{ token: "023e105f4ecef8ad9ca31a8372d0c353", expected: "<hex>" },
		{ token: "12345", expected: "<number>" },
		{ token: "example.com", expected: "<domain>" },
		{ token: "my-worker", expected: "<word>" },
		{ token: "sk_live_secret", expected: "<word>" },
		{ token: "-", expected: "<other>" },
		{ token: "", expected: "<other>" },
	])("maps $token to $expected", ({ token, expected }) => {
		expect(sanitizeCommandToken(token, commands)).toBe(expected);
	});

	it("classifies only the first 64 characters", () => {
		expect(sanitizeCommandToken("w".repeat(500), commands)).toBe("<word>");
		expect(sanitizeCommandToken(`${"f".repeat(64)} x`, commands)).toBe("<hex>");
	});

	it("reduces every token to its shape without a vocabulary", () => {
		expect(sanitizeCommandToken("zones", new Set())).toBe("<word>");
	});
});

describe("sanitizeCommandResolution", () => {
	it("keeps the recognised path and sanitises unknown tokens", () => {
		expect(
			sanitizeCommandResolution(
				failure({
					kind: "surplus-positional",
					knownCommand: ["zones", "list"],
					knownCommandIsLeaf: true,
					unknownTokens: ["023e105f4ecef8ad9ca31a8372d0c353"],
				}),
				["zones", "list", "023e105f4ecef8ad9ca31a8372d0c353"],
				vocabulary
			)
		).toEqual({
			resolutionFailure: "surplus-positional",
			knownCommand: "zones list",
			knownCommandIsLeaf: true,
			unknownTokens: ["<hex>"],
			unknownTokenCount: 1,
			unknownFlagCount: 0,
			argsUsed: [],
			argsCombination: "",
		});
	});

	it("labels a surplus positional even when it is a cf command word", () => {
		const tokens = ["zones", "list"];
		expect(
			sanitizeCommandResolution(
				failure({
					kind: "surplus-positional",
					knownCommand: ["workers", "get"],
					knownCommandIsLeaf: true,
					unknownTokens: tokens,
				}),
				["workers", "get", ...tokens],
				vocabulary
			).unknownTokens
		).toEqual(["<word>", "<word>"]);
		expect(
			sanitizeCommandResolution(
				failure({ knownCommand: ["workers"], unknownTokens: tokens }),
				["workers", ...tokens],
				vocabulary
			).unknownTokens
		).toEqual(tokens);
	});

	it("caps the tokens sent but reports the real count", () => {
		const result = sanitizeCommandResolution(
			failure({ unknownTokens: ["a", "b", "c", "d", "e"] }),
			["a", "b", "c", "d", "e"],
			vocabulary
		);
		expect(result.unknownTokens).toHaveLength(MAX_UNKNOWN_TOKENS);
		expect(result.unknownTokenCount).toBe(5);
	});

	it("names known flags and only counts unknown ones", () => {
		const rawArgv = [
			"zones",
			"--zone-id",
			"abc123",
			"--zone=example.com",
			"--sk_live_secret",
			"--other-secret=value",
			"--",
			"--after-separator",
		];
		const result = sanitizeCommandResolution(
			failure({ knownCommand: ["zones"], unknownTokens: [] }),
			rawArgv,
			vocabulary
		);
		expect(result.argsUsed).toEqual(["zone", "zone-id"]);
		expect(result.argsCombination).toBe("zone, zone-id");
		expect(result.unknownFlagCount).toBe(2);
		const serialised = JSON.stringify(result);
		for (const value of [
			"abc123",
			"example.com",
			"sk_live",
			"secret",
			"value",
			"after-separator",
		]) {
			expect(serialised).not.toContain(value);
		}
	});

	it("includes a suggestion only for suggested-command failures", () => {
		expect(
			sanitizeCommandResolution(
				failure({
					kind: "suggested-command",
					knownCommand: ["r2", "buckets"],
					unknownTokens: ["lsit"],
					suggestedCommand: "list",
				}),
				[],
				vocabulary
			).suggestedCommand
		).toBe("list");
		expect(
			sanitizeCommandResolution(
				failure({ suggestedCommand: "list" }),
				[],
				vocabulary
			)
		).not.toHaveProperty("suggestedCommand");
	});

	it("drops a suggestion that does not look like a command name", () => {
		expect(
			sanitizeCommandResolution(
				failure({
					kind: "suggested-command",
					suggestedCommand: "not a command",
				}),
				[],
				vocabulary
			)
		).not.toHaveProperty("suggestedCommand");
	});
});

describe("loadCommandVocabulary", () => {
	afterEach(() => {
		__resetCommandVocabularyForTests();
		if (actualLoadMeta.current) {
			loadMeta.mockImplementation(actualLoadMeta.current);
		}
	});

	it("reads command words and option names from the catalogue", () => {
		const loaded = loadCommandVocabulary(["quiet"]);
		for (const word of ["zones", "list", "workers", "help", "whoami"]) {
			expect(loaded.commands.has(word)).toBe(true);
		}
		for (const option of ["zone-id", "dry-run", "quiet", "help"]) {
			expect(loaded.options.has(option)).toBe(true);
		}
		expect(loaded.commands.has("my-worker")).toBe(false);
	});

	it("falls back to global options when the catalogue cannot load", () => {
		loadMeta.mockImplementation(() => null);
		const loaded = loadCommandVocabulary(["quiet", "zone"]);
		expect(loaded.commands.size).toBe(0);
		expect([...loaded.options].sort()).toEqual([
			"help",
			"quiet",
			"version",
			"zone",
		]);
	});

	it("falls back when reading the catalogue throws", () => {
		loadMeta.mockImplementation(() => {
			throw new Error("unreadable");
		});
		expect(loadCommandVocabulary([]).commands.size).toBe(0);
	});
});
