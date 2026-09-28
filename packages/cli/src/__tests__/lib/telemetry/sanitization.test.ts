import { describe, expect, it } from "vitest";
import { REDACTED, sanitizeArgs } from "../../../lib/telemetry/sanitization.js";
import { CloudflareApiError } from "#sdk";

describe("sanitizeArgs", () => {
	it("records finite values and redacts free-form values", () => {
		const result = sanitizeArgs(
			{ type: "A", dryRun: true, zone: "example.com", perPage: 50 },
			[
				"records",
				"list",
				"--type=A",
				"--dry-run",
				"--zone",
				"example.com",
				"--per-page",
				"50",
			],
			{ safeFlags: ["type", "dry-run"] }
		);

		expect(result.sanitizedArgs).toEqual({
			type: "A",
			"dry-run": true,
			zone: REDACTED,
			"per-page": REDACTED,
		});
		expect(result.argsUsed).toEqual(["dry-run", "per-page", "type", "zone"]);
	});

	it("does not inspect positional, body, or file values", () => {
		const result = sanitizeArgs(
			{ id: "secret", body: "secret", file: "secret.json", force: true },
			["delete", "secret", "--body", "secret", "--file=secret.json", "--force"],
			{ safeFlags: ["force"] }
		);
		expect(result.sanitizedArgs).toEqual({
			body: REDACTED,
			file: REDACTED,
			force: true,
		});
		expect(JSON.stringify(result)).not.toContain("secret.json");
	});

	it("only records text when the command classifies it as safe", () => {
		const secretText = sanitizeArgs(
			{ text: "secret" },
			["update", "--text=secret"],
			{ safeFlags: [] }
		);
		expect(secretText.sanitizedArgs).toEqual({ text: REDACTED });

		const booleanText = sanitizeArgs({ text: true }, ["get", "--text"], {
			safeFlags: ["text"],
		});
		expect(booleanText.sanitizedArgs).toEqual({ text: true });
	});

	it("records known global boolean values", () => {
		const result = sanitizeArgs(
			{ quiet: true, local: false, zone: "example.com" },
			["list", "--quiet", "--no-local", "--zone", "example.com"],
			{ safeFlags: [] }
		);

		expect(result.sanitizedArgs).toEqual({
			quiet: true,
			local: false,
			zone: REDACTED,
		});
	});

	it("canonicalizes short flag aliases", () => {
		const result = sanitizeArgs(
			{ force: true, quiet: true, zone: "example.com" },
			["delete", "-qf", "-z=example.com"],
			{
				safeFlags: ["force"],
				shortFlagAliases: {
					f: { canonical: "force", type: "boolean" },
				},
			}
		);

		expect(result.sanitizedArgs).toEqual({
			quiet: true,
			force: true,
			zone: REDACTED,
		});
		expect(result.argsUsed).toEqual(["force", "quiet", "zone"]);
	});

	it("ignores implementation arguments after the option terminator", () => {
		const result = sanitizeArgs(
			{},
			["dev", "--", "--user-controlled-name=secret"],
			{ safeFlags: [] }
		);
		expect(result).toEqual({
			sanitizedArgs: {},
			argsUsed: [],
			argsCombination: "",
		});
	});
});
