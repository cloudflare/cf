import * as clack from "@clack/prompts";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import {
	confirm,
	confirmDelete,
	promptForAcknowledgement,
	promptForRequiredEnumField,
	promptForRequiredField,
} from "../../lib/prompt.js";

vi.mock("@clack/prompts", () => ({
	confirm: vi.fn(),
	password: vi.fn(),
	select: vi.fn(),
	text: vi.fn(),
}));

const cancelResult = vi.hoisted(() => Symbol("test prompt cancellation"));
vi.mock("@clack/core", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	isCancel: (value: unknown) => value === cancelResult,
}));

/**
 * `ci-info` reads the environment once, when it is imported, so setting
 * `process.env.CI` inside a test changes nothing — and whether the real
 * flag is on depends on where the suite happens to be running. Mocking it
 * makes the CI half of `isNonInteractiveOrCI` a lever these tests hold,
 * leaving the TTY half to `setTTY`.
 */
const ciInfo = vi.hoisted(() => ({ isCI: false }));
vi.mock("ci-info", () => ({ default: ciInfo }));

/**
 * Tests for the interactive gatekeepers in `lib/prompt.ts`, which share
 * one contract: they may only prompt when there is a real terminal to
 * prompt on, and must refuse rather than assume when there isn't.
 *
 * For `confirmDelete` — the destructive-action gate used by every
 * generated DELETE handler (and forge `x-forge-require-confirmation`
 * non-DELETE ops) — the critical case is: **`--quiet` does NOT bypass the
 * confirmation prompt.** Only `--force` does. The original bug treated
 * `--quiet` as an implicit "yes" to destructive operations, which let users
 * wipe resources without realising they'd opted into a confirmation skip.
 *
 * Non-interactive contexts (no TTY, or CI env) without `--force` must
 * refuse rather than silently confirm.
 */
describe("prompt", () => {
	let originalIsTTY: boolean | undefined;
	let originalStdoutIsTTY: boolean | undefined;
	let writtenStderr: string[];
	let originalStderrWrite: typeof process.stderr.write;
	let originalCI: string | undefined;

	beforeEach(() => {
		originalIsTTY = process.stdin.isTTY;
		originalStdoutIsTTY = process.stdout.isTTY;
		writtenStderr = [];
		originalStderrWrite = process.stderr.write.bind(process.stderr);
		// Capture stderr so we can assert on the "non-interactive" message
		// without polluting test output. `as any` because the real signature
		// is overloaded (Buffer vs string + callback).
		(process.stderr.write as unknown) = (chunk: unknown) => {
			writtenStderr.push(String(chunk));
			return true;
		};
		// Force a non-CI environment by default; the CI fast-path is
		// exercised separately. The env var is snapshotted for any code that
		// reads it directly, but `isNonInteractiveOrCI` sees `ciInfo` above.
		ciInfo.isCI = false;
		originalCI = process.env.CI;
		delete process.env.CI;
	});

	afterEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(process.stdin, "isTTY", {
			value: originalIsTTY,
			configurable: true,
		});
		Object.defineProperty(process.stdout, "isTTY", {
			value: originalStdoutIsTTY,
			configurable: true,
		});
		(process.stderr.write as unknown) = originalStderrWrite;
		if (originalCI === undefined) {
			delete process.env.CI;
		} else {
			process.env.CI = originalCI;
		}
	});

	function setTTY(value: boolean): void {
		Object.defineProperty(process.stdin, "isTTY", {
			value,
			configurable: true,
		});
		Object.defineProperty(process.stdout, "isTTY", {
			value,
			configurable: true,
		});
	}

	it("shows enum titles but returns the API wire value", async () => {
		setTTY(true);
		vi.mocked(clack.select).mockResolvedValue("IND");

		await expect(
			promptForRequiredEnumField(
				"contact-extensions-registrant-type",
				"Registrant Type",
				["LTD", "IND"],
				{
					LTD: "UK Limited Company",
					IND: "UK Individual (representing self)",
				}
			)
		).resolves.toBe("IND");
		expect(clack.select).toHaveBeenCalledWith({
			message: "Registrant Type",
			options: [
				{ value: "LTD", label: "UK Limited Company" },
				{ value: "IND", label: "UK Individual (representing self)" },
			],
		});
	});

	it("uses prototype-named wire values when no own label exists", async () => {
		setTTY(true);
		vi.mocked(clack.select).mockResolvedValue("constructor");

		await expect(
			promptForRequiredEnumField("kind", "Kind", [
				"toString",
				"constructor",
				"__proto__",
			])
		).resolves.toBe("constructor");
		expect(clack.select).toHaveBeenCalledWith({
			message: "Kind",
			options: [
				{ value: "toString", label: "toString" },
				{ value: "constructor", label: "constructor" },
				{ value: "__proto__", label: "__proto__" },
			],
		});
	});

	it("sanitizes enum display text without changing the wire value", async () => {
		setTTY(true);
		const rawChoice = "IN\u001b\u202e\u2028\u2029D";
		vi.mocked(clack.select).mockResolvedValue(rawChoice);

		await expect(
			promptForRequiredEnumField(
				"registrant-type",
				"Registrant\u001b\u202e\u2028\u2029 Type",
				[rawChoice]
			)
		).resolves.toBe(rawChoice);
		expect(clack.select).toHaveBeenCalledWith({
			message: "Registrant     Type",
			options: [{ value: rawChoice, label: "IN    D" }],
		});
	});

	it("sanitizes enum values in non-interactive errors", async () => {
		setTTY(false);
		const rawChoice = "IN\u001b\u202e\u2028\u2029D";

		await expect(
			promptForRequiredEnumField("registrant-type", "", [rawChoice])
		).rejects.toThrow(
			"--registrant-type is required (one of: IN    D). Pass --registrant-type <value> or run interactively."
		);
	});

	it("passes schema validation through to interactive text input", async () => {
		setTTY(true);
		vi.mocked(clack.text).mockResolvedValue("+1555");
		const validate = vi.fn((value: string) =>
			/^\+[0-9]+$/.test(value) ? undefined : "Invalid phone number"
		);

		await expect(
			promptForRequiredField("phone", "Phone", { validate })
		).resolves.toBe("+1555");
		const promptOptions = vi.mocked(clack.text).mock.calls[0]?.[0];
		const promptValidate = promptOptions?.validate;
		if (typeof promptValidate !== "function") {
			throw new Error("Expected a prompt validator");
		}
		expect(promptValidate("")).toBe("Value cannot be empty");
		expect(promptValidate("555")).toBe("Invalid phone number");
		expect(promptValidate("+1555")).toBeUndefined();
	});

	describe("confirmDelete --force bypasses the prompt", () => {
		it("returns true when force is true (interactive)", async () => {
			setTTY(true);
			const result = await confirmDelete({ force: true });
			expect(result).toBe(true);
			// No prompt should have rendered → no stderr.
			expect(writtenStderr.join("")).toBe("");
		});

		it("returns true when force is true (non-interactive)", async () => {
			setTTY(false);
			const result = await confirmDelete({ force: true });
			expect(result).toBe(true);
		});

		it("returns true when force is true (CI env)", async () => {
			setTTY(false);
			ciInfo.isCI = true;
			process.env.CI = "1";
			const result = await confirmDelete({ force: true });
			expect(result).toBe(true);
		});
	});

	describe("confirm", () => {
		it("uses Wrangler's affirmative fallback when non-interactive", async () => {
			setTTY(false);

			await expect(confirm("Continue?")).resolves.toBe(true);
			expect(clack.confirm).not.toHaveBeenCalled();
			expect(writtenStderr.join("")).toContain(
				"Using fallback value in non-interactive context: yes"
			);
		});

		it("defaults to yes when interactive", async () => {
			setTTY(true);
			vi.mocked(clack.confirm).mockResolvedValue(true);

			await expect(confirm("Continue?")).resolves.toBe(true);
			expect(clack.confirm).toHaveBeenCalledWith({
				message: "Continue?",
				initialValue: true,
			});
		});
	});

	describe("confirmDelete non-interactive without --force aborts", () => {
		it("returns false and writes a hint to stderr", async () => {
			setTTY(false);
			const result = await confirmDelete();
			expect(result).toBe(false);
			const output = writtenStderr.join("");
			expect(output).toContain("This permanently deletes the resource");
			expect(output).toContain("pass --force to confirm");
		});

		it("surfaces a forge-supplied message verbatim", async () => {
			setTTY(false);
			const result = await confirmDelete({
				message: "This operation drops every message in the queue.",
			});
			expect(result).toBe(false);
			const output = writtenStderr.join("");
			expect(output).toContain(
				"This operation drops every message in the queue. Continue?"
			);
		});

		it("returns false in CI env even with a TTY", async () => {
			setTTY(true);
			ciInfo.isCI = true;
			process.env.CI = "1";
			const result = await confirmDelete();
			expect(result).toBe(false);
			// Proves the CI branch ran rather than a prompt resolving falsy.
			expect(writtenStderr.join("")).toContain("pass --force to confirm");
			expect(clack.confirm).not.toHaveBeenCalled();
		});
	});

	describe("promptForAcknowledgement", () => {
		it("returns false when the acknowledgement is declined", async () => {
			setTTY(true);
			vi.mocked(clack.confirm).mockResolvedValue(false);

			await expect(
				promptForAcknowledgement("terms", "Accept the terms")
			).resolves.toBe(false);
		});

		it("returns true when the acknowledgement is accepted", async () => {
			setTTY(true);
			vi.mocked(clack.confirm).mockResolvedValue(true);

			await expect(
				promptForAcknowledgement("terms", "Accept the terms")
			).resolves.toBe(true);
		});

		it("points at the flag instead of prompting when non-interactive", async () => {
			setTTY(false);

			await expect(
				promptForAcknowledgement("terms", "Accept the terms")
			).rejects.toThrow(/--terms is required and must be true/);
			expect(clack.confirm).not.toHaveBeenCalled();
		});

		it("points at the flag in CI even with a TTY", async () => {
			setTTY(true);
			ciInfo.isCI = true;

			await expect(
				promptForAcknowledgement("terms", "Accept the terms")
			).rejects.toThrow(/--terms is required and must be true/);
			expect(clack.confirm).not.toHaveBeenCalled();
		});
	});

	describe("interactive cancellation", () => {
		const cancellation = { name: "CliExit", code: 130, cancelled: true };

		it("throws CliExit from required text prompts", async () => {
			setTTY(true);
			vi.mocked(clack.text).mockResolvedValue(cancelResult as never);

			await expect(
				promptForRequiredField("name", "Name")
			).rejects.toMatchObject(cancellation);
		});

		it("throws CliExit from required enum prompts", async () => {
			setTTY(true);
			vi.mocked(clack.select).mockResolvedValue(cancelResult as never);

			await expect(
				promptForRequiredEnumField("kind", "Kind", ["one"])
			).rejects.toMatchObject(cancellation);
		});

		it("throws CliExit from acknowledgement prompts", async () => {
			setTTY(true);
			vi.mocked(clack.confirm).mockResolvedValue(cancelResult as never);

			await expect(
				promptForAcknowledgement("terms", "Accept the terms")
			).rejects.toMatchObject(cancellation);
		});

		it("throws CliExit from general confirmations", async () => {
			setTTY(true);
			vi.mocked(clack.confirm).mockResolvedValue(cancelResult as never);

			await expect(confirm("Continue?")).rejects.toMatchObject(cancellation);
		});

		it("throws CliExit from destructive confirmations", async () => {
			setTTY(true);
			vi.mocked(clack.confirm).mockResolvedValue(cancelResult as never);

			await expect(confirmDelete()).rejects.toMatchObject(cancellation);
		});
	});
});
