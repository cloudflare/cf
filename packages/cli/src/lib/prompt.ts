import { isCancel, SelectPrompt } from "@clack/core";
import * as clack from "@clack/prompts";
import { VERSION } from "../version.js";
import { CliExit } from "./cli-exit.js";
import { isNonInteractiveOrCI } from "./interactive.js";
import { openSession } from "./session.js";
import { sanitizeTerminalText } from "./ui/sanitize.js";
import { theme } from "./ui/theme.js";

/**
 * Defensive banner emission. The normal flow is `main()` →
 * `openSession()` once at the top of the process, which runs before
 * any command handler. But tests sometimes stub `main()` and invoke
 * a prompt directly. `openSession` is idempotent, so calling it
 * again before each prompt is cheap and ensures the banner has been
 * emitted if the test path skipped it.
 */
function ensureSession(): void {
	openSession(VERSION);
}

/**
 * An account option for the interactive picker
 */
export interface AccountOption {
	id: string;
	name: string;
}

/**
 * Prompt the user to select an account from a list using @clack/core.
 *
 * @param accounts - List of available accounts
 * @returns The selected account, or null if the user cancelled
 */
export async function selectAccount(
	accounts: AccountOption[]
): Promise<AccountOption | null> {
	const options = accounts.map((account) => ({
		value: account,
		label: account.name,
	}));

	const prompt = new SelectPrompt({
		options,
		initialValue: options[0]?.value,
		render() {
			const title = theme.bold("Select an account");

			// Build the options list
			const lines = this.options.map((option, i) => {
				const isActive = i === this.cursor;
				const account = option.value;
				const truncatedId = theme.muted(`${account.id.slice(0, 12)}...`);

				if (isActive) {
					return `  ${theme.brand(">")} ${theme.bold(account.name)}  ${truncatedId}`;
				}
				return `    ${theme.muted(account.name)}  ${truncatedId}`;
			});

			const hint = theme.muted("(use arrow keys, enter to confirm)");

			return `${title} ${hint}\n${lines.join("\n")}`;
		},
	});

	const result = await prompt.prompt();

	if (isCancel(result) || !result) {
		return null;
	}

	return result;
}

/**
 * Read all of stdin as a UTF-8 string. Trailing newline (if any) is stripped
 * — so `echo "hunter2" | cf ...` works the obvious way.
 */
async function readAllStdin(): Promise<string> {
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) {
		chunks.push(Buffer.from(chunk));
	}
	const s = Buffer.concat(chunks).toString("utf-8");
	return s.endsWith("\n") ? s.slice(0, -1) : s;
}

/**
 * Prompt the user for a missing required field.
 *
 * Used by generated handlers when the user didn't pass `--<flag>` and we
 * need a value before we can build the API request.  Modes:
 *
 *   1. Interactive TTY → clack prompt (`text` or `password` depending on
 *      `kind`).  `kind` defaults to `text` and is set to `secret` only
 *      when the upstream OpenAPI schema marks the field as sensitive
 *      (forge surfaces this as `BodyParamInfo.sensitive` from
 *      `x-sensitive: true`; the generator threads it through to this
 *      `options.kind`). There is intentionally no name-based heuristic
 *      — the spec is the single source of truth for what counts as a
 *      secret.
 *   2. Non-TTY + secret-shaped flag (`kind: "secret"`): try reading
 *      from piped stdin (e.g. `echo "$TOKEN" | cf ...`).  Only secrets
 *      take this path — for non-secret flags like `--title` piping
 *      doesn't fit the call shape, and pretending it does in the error
 *      message just confuses people.
 *   3. Non-TTY + non-secret, OR closed/empty stdin → throw a helpful
 *      error pointing at `--<flagName> <value>` or interactive mode.
 *
 * @param flagName The kebab-case flag name (e.g. "text")
 * @param description Field description (shown as the prompt question)
 * @param options.kind `text` (default) or `secret`. Generated handlers
 *                    pass `secret` when forge marks the field as
 *                    `x-sensitive: true`.
 * @param options.question Optional override for the top-line prompt
 */
export async function promptForRequiredField(
	flagName: string,
	description: string,
	options?: {
		kind?: "text" | "secret";
		question?: string;
		validate?: (value: string) => string | undefined;
	}
): Promise<string> {
	const kind = options?.kind ?? "text";

	if (isNonInteractiveOrCI()) {
		// Only secret-shaped flags accept piped stdin. Non-secret flags
		// have no sensible "echo X | cf …" shape — fail fast instead.
		if (kind === "secret") {
			const piped = await readAllStdin();
			if (piped.length > 0) {
				return piped;
			}
			throw new Error(
				`--${flagName} is required. Pipe the value via stdin, pass --${flagName} <value>, or run interactively.`
			);
		}
		throw new Error(
			`--${flagName} is required. Pass --${flagName} <value> or run interactively.`
		);
	}
	const fallbackQuestion = `Enter value for --${flagName}`;
	// If the caller provides a description it's more useful than the
	// synthesized "Enter value for --flag" — show only the description.
	const message = description || options?.question || fallbackQuestion;
	const validate = (value: string | undefined): string | undefined =>
		value && value.length > 0
			? options?.validate?.(value)
			: "Value cannot be empty";

	ensureSession();
	const result =
		kind === "secret"
			? await clack.password({
					message,
					mask: "•",
					validate,
				})
			: await clack.text({
					message,
					validate,
				});

	if (isCancel(result) || typeof result !== "string") {
		// User cancelled (ctrl+c / esc) — match wrangler's behavior.
		throw new CliExit(130, { cancelled: true });
	}
	return result;
}

/**
 * Prompt the user to pick one of a fixed set of choices.
 *
 * Used for generated body fields with `choices: [...]` (i.e. enum-typed
 * body params) when the user didn't pass `--<flag>` in interactive
 * mode. Same TTY/non-TTY behaviour as `promptForRequiredField`:
 * non-interactive contexts throw with the list of valid choices.
 *
 * @param flagName The kebab-case flag name (e.g. "type")
 * @param description Field description (shown as the prompt question)
 * @param choices The valid values, in display order
 */
export async function promptForRequiredEnumField(
	flagName: string,
	description: string,
	choices: readonly string[],
	choiceLabels: Readonly<Record<string, string>> = {}
): Promise<string> {
	const displayFlagName = sanitizeTerminalText(flagName);
	const displayChoices = choices.map(sanitizeTerminalText);
	if (isNonInteractiveOrCI()) {
		throw new Error(
			`--${displayFlagName} is required (one of: ${displayChoices.join(", ")}). Pass --${displayFlagName} <value> or run interactively.`
		);
	}
	const fallbackQuestion = `Select value for --${displayFlagName}`;
	const message = sanitizeTerminalText(description || fallbackQuestion);

	ensureSession();
	const result = await clack.select({
		message,
		options: choices.map((choice) => {
			const ownLabel = Object.hasOwn(choiceLabels, choice)
				? choiceLabels[choice]
				: undefined;
			return {
				value: choice,
				label: sanitizeTerminalText(ownLabel ?? choice),
			};
		}),
	});

	if (isCancel(result) || typeof result !== "string") {
		throw new CliExit(130, { cancelled: true });
	}
	return result;
}

/**
 * Prompt for a required boolean the caller must affirm.
 *
 * Distinct from {@link confirmDelete}, which guards an action cf is about
 * to take. This collects a *field value* the API requires to be `true` —
 * the acknowledgement idiom, where a schema declares
 * `{ type: "boolean", const: true }` with the text the user has to agree to.
 * Answering no returns `false` so the command can abort cleanly.
 * Non-interactive contexts throw and point at the flag.
 */
export async function promptForAcknowledgement(
	flagName: string,
	description: string
): Promise<boolean> {
	if (isNonInteractiveOrCI()) {
		throw new Error(
			`--${flagName} is required and must be true. Pass --${flagName} or run interactively.`
		);
	}

	ensureSession();
	const result = await clack.confirm({
		message: description || `Confirm --${flagName}`,
		initialValue: false,
	});
	if (isCancel(result)) {
		throw new CliExit(130, { cancelled: true });
	}
	return result === true;
}

interface ConfirmOptions {
	defaultValue?: boolean;
	fallbackValue?: boolean;
}

/** Wrangler-compatible confirmation for hand-written workflow commands. */
export async function confirm(
	text: string,
	{ defaultValue = true, fallbackValue = true }: ConfirmOptions = {}
): Promise<boolean> {
	if (isNonInteractiveOrCI()) {
		process.stderr.write(
			`? ${text}\n  Using fallback value in non-interactive context: ${fallbackValue ? "yes" : "no"}\n`
		);
		return fallbackValue;
	}

	ensureSession();
	const result = await clack.confirm({
		message: text,
		initialValue: defaultValue,
	});
	if (isCancel(result)) {
		throw new CliExit(130, { cancelled: true });
	}
	return result === true;
}

/**
 * Prompt for confirmation before a destructive operation.
 *
 * Resolution order:
 *   1. `opts.force === true` → skip prompt, return `true` (CI-friendly).
 *      This is the ONLY opt-out for destructive prompts. In particular,
 *      `--quiet` does NOT bypass confirmation — it only suppresses
 *      non-essential output. Bypassing confirmation requires an explicit
 *      `--force`, even in CI/scripting contexts.
 *   2. Non-interactive context (no TTY or CI env) → log a pseudo-prompt
 *      and abort with `false`. Matches wrangler's default for destructive
 *      commands: don't silently assume yes in CI unless --force is passed.
 *   3. Interactive TTY → show a clack.confirm prompt with the resource
 *      type and id. Default answer is "no" (safe default for deletes).
 *
 * Callers should short-circuit (early return / skip the API call) when
 * this returns `false`, and should NOT treat it as an error.
 *
 * @param resourceType Human-readable noun (e.g. "secret", "zone")
 * @param resourceId The resource's id/name (e.g. "SECRET_API_KEY")
 * @param opts.force If true, skip the prompt and confirm
 * @param opts.message Override the default "Delete X? This cannot be undone."
 *   prompt with a custom one-line warning (used by forge's
 *   `x-forge-require-confirmation` annotation, where the API method
 *   description supplies the destructive-action wording).
 */
export async function confirmDelete(
	opts: { force?: boolean; message?: string } = {}
): Promise<boolean> {
	if (opts.force === true) {
		return true;
	}

	// Forge supplies a per-op sentence via `x-forge-require-confirmation`
	// for ops whose destructiveness isn't obvious from the verb. Everything
	// else falls back to a generic warning — the command the user just typed
	// already names the resource, so the prompt doesn't repeat it.
	const question = opts.message
		? `${opts.message} Continue?`
		: "This permanently deletes the resource. Continue?";

	if (isNonInteractiveOrCI()) {
		// Non-interactive but no --force: surface what was asked and why we
		// aborted, so CI logs are useful when a pipeline fails here.
		process.stderr.write(
			`${theme.warning("?")} ${question}\n` +
				`  ${theme.muted("(non-interactive; pass --force to confirm)")}\n`
		);
		return false;
	}

	ensureSession();
	const result = await clack.confirm({
		message: question,
		initialValue: false, // default to "no" — deletes are destructive
	});
	if (isCancel(result)) {
		// User hit ctrl+c. Treat like wrangler: exit non-zero.
		throw new CliExit(130, { cancelled: true });
	}
	return result === true;
}
