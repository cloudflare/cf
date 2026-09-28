import { isCancel } from "@clack/core";
import * as clack from "@clack/prompts";
import { CliExit } from "./cli-exit.js";
import { isNonInteractiveOrCI } from "./interactive.js";

export async function confirm(
	text: string,
	options: {
		defaultValue: boolean;
		fallbackValue?: boolean;
		output?: NodeJS.WriteStream;
	}
): Promise<boolean> {
	if (isNonInteractiveOrCI()) {
		return options.fallbackValue ?? false;
	}

	const result = await clack.confirm({
		message: text,
		initialValue: options.defaultValue,
		output: options.output,
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
		output?: NodeJS.WriteStream;
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
			message: text,
			defaultValue: options.defaultValue,
			initialValue: options.initialValue,
			placeholder: options.placeholder,
			output: options.output,
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
		output?: NodeJS.WriteStream;
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
		output: options.output,
	});

	if (isCancel(result)) {
		throw new CliExit(130, { cancelled: true });
	}

	return result as Value;
}
