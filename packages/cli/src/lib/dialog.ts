import { isCancel, wrapTextWithPrefix } from "@clack/core";
import * as clack from "@clack/prompts";
import { CliExit } from "./cli-exit.js";
import { isNonInteractiveOrCI } from "./interactive.js";
import { theme } from "./ui/theme.js";

/**
 * Wraps a text prompt's message to the stderr terminal it draws on. clack
 * measures each frame against stdout, which has no width once redirected,
 * and of its prompts only select and confirm wrap their own message.
 */
export function wrapPromptMessage(message: string): string {
	if (process.stdout.columns || !process.stderr.columns) {
		return message;
	}
	return wrapTextWithPrefix(
		process.stderr,
		message,
		`${theme.muted("│")}  `,
		""
	);
}

export async function confirm(
	text: string,
	options: {
		defaultValue: boolean;
		fallbackValue?: boolean;
	}
): Promise<boolean> {
	if (isNonInteractiveOrCI()) {
		return options.fallbackValue ?? false;
	}

	const result = await clack.confirm({
		message: text,
		initialValue: options.defaultValue,
		output: process.stderr,
	});

	if (isCancel(result)) {
		throw new CliExit(130, { cancelled: true });
	}

	return result;
}

export async function prompt(
	text: string,
	options: {
		defaultValue?: string;
		initialValue?: string;
		placeholder?: string;
		fallbackValue?: string;
		fallbackError?: string;
		validate?: (value: string) => boolean | string | Promise<boolean | string>;
	} = {}
): Promise<string> {
	if (isNonInteractiveOrCI()) {
		if (options.fallbackValue === undefined) {
			throw new Error(options.fallbackError);
		}

		return options.fallbackValue;
	}
	// Clack's validator is synchronous, while callers may provide asynchronous
	// validation, so validate after each prompt and retry when needed.
	while (true) {
		const result = await clack.text({
			message: wrapPromptMessage(text),
			defaultValue: options.defaultValue,
			initialValue: options.initialValue,
			placeholder: options.placeholder,
			output: process.stderr,
		});

		if (isCancel(result)) {
			throw new CliExit(130, { cancelled: true });
		}

		const validation = await options.validate?.(result);
		if (validation === undefined || validation === true) {
			return result;
		}

		console.error(validation === false ? "Invalid value" : validation);
	}
}

export async function select<Value extends string>(
	text: string,
	options: {
		choices: Array<{
			title: string;
			description?: string | undefined;
			value: Value;
		}>;
		defaultOption?: number;
		fallbackOption?: number;
		fallbackError?: string;
	}
): Promise<Value> {
	if (isNonInteractiveOrCI()) {
		const index = options.fallbackOption ?? options.defaultOption ?? 0;
		const choice = options.choices[index] ?? options.choices[0];

		if (!choice) {
			throw new Error(
				options.fallbackError ?? "select() called with no choices"
			);
		}

		return choice.value;
	}

	// Clack's Option type cannot resolve while Value is still generic, so use
	// strings at the Clack boundary and narrow back to the supplied value type.
	const result = await clack.select<string>({
		message: text,
		options: options.choices.map((choice) => ({
			label: choice.title,
			value: choice.value,
			hint: choice.description,
		})),
		initialValue: options.choices[options.defaultOption ?? 0]?.value as
			| string
			| undefined,
		output: process.stderr,
	});

	if (isCancel(result)) {
		throw new CliExit(130, { cancelled: true });
	}

	return result as Value;
}
