// eslint-disable-next-line no-restricted-imports
import { expect } from "vitest";

/**
 * Shared queue-based dialog mocking.
 *
 * The wrangler test corpus uses `mockConfirm`/`mockPrompt`/`mockSelect`
 * to register expected dialog interactions in order. Wrangler used the
 * `prompts` npm package; cf uses `@clack/prompts`. Both are mocked
 * (`prompts` here, `@clack/prompts` in vitest.setup.ts) — and both
 * consume from the queues populated below — so the test surface is
 * unchanged regardless of which prompts library the underlying CLI
 * uses.
 *
 * Each `mockX` registers a one-shot expectation; the next matching
 * dialog call returns the registered `result` and asserts the dialog's
 * message text matches.
 */

export interface ConfirmExpectation {
	/** The text expected to be seen in the confirmation dialog. */
	text: string;

	options?: { defaultValue: boolean };
	/** The mock response sent back from the confirmation dialog. */
	result: boolean;
}

export interface PromptExpectation {
	/** The text expected to be seen in the prompt dialog. */
	text: string;
	options?: {
		defaultValue?: string;
		isSecret?: boolean;
	};
	/** The mock response sent back from the prompt dialog. */
	result: string;
}

interface SelectOption<Values> {
	title: string;
	description?: string;
	value: Values;
}
interface SelectOptions<Values> {
	choices: SelectOption<Values>[];
	defaultOption?: number;
}
export interface SelectExpectation<Values> {
	/** The text expected to be seen in the select dialog. */
	text: string;
	options?: SelectOptions<Values>;
	/** The mock response sent back from the select dialog. */
	result: string;
}

const confirmQueue: ConfirmExpectation[] = [];
const promptQueue: PromptExpectation[] = [];
// SelectExpectation is parameterised by the choice-value type, but the
// queue holds them with `unknown` since values are only compared when
// `expectation.options.choices` is provided. (Most tests don't.)
const selectQueue: SelectExpectation<unknown>[] = [];

export function mockConfirm(...expectations: ConfirmExpectation[]) {
	confirmQueue.push(...expectations);
}

export function mockPrompt(...expectations: PromptExpectation[]) {
	promptQueue.push(...expectations);
}

export function mockSelect<Values>(
	...expectations: SelectExpectation<Values>[]
) {
	selectQueue.push(...(expectations as SelectExpectation<unknown>[]));
}

export function clearDialogs() {
	confirmQueue.length = 0;
	promptQueue.length = 0;
	selectQueue.length = 0;
}

// ---------------------------------------------------------------------
// Internal consumers — called from the prompts/@clack mocks installed
// in vitest.setup.ts. Each consumer takes the dialog's call args, pops
// the next expectation off the relevant queue, asserts the message
// matches, and returns the canned result.
// ---------------------------------------------------------------------

export function _consumeConfirm(args: {
	message: string;
	defaultValue?: boolean;
}): boolean {
	const exp = confirmQueue.shift();
	if (!exp) {
		throw new Error(
			`Unexpected call to confirm() with message ${JSON.stringify(args.message)}. ` +
				`Use mockConfirm() to register an expectation first.`
		);
	}
	expect(args.message).toStrictEqual(exp.text);
	if (exp.options) {
		expect(args.defaultValue).toStrictEqual(exp.options.defaultValue);
	}
	return exp.result;
}

export function _consumePrompt(args: {
	message: string;
	defaultValue?: string;
	isSecret?: boolean;
}): string {
	const exp = promptQueue.shift();
	if (!exp) {
		throw new Error(
			`Unexpected call to prompt() with message ${JSON.stringify(args.message)}. ` +
				`Use mockPrompt() to register an expectation first.`
		);
	}
	expect(args.message).toStrictEqual(exp.text);
	if (exp.options) {
		if (exp.options.defaultValue !== undefined) {
			expect(args.defaultValue).toStrictEqual(exp.options.defaultValue);
		}
		if (exp.options.isSecret !== undefined) {
			expect(args.isSecret ?? false).toStrictEqual(exp.options.isSecret);
		}
	}
	return exp.result;
}

export function _consumeSelect(args: {
	message: string;
	choices?: unknown;
	defaultOption?: number;
}): string {
	const exp = selectQueue.shift();
	if (!exp) {
		throw new Error(
			`Unexpected call to select() with message ${JSON.stringify(args.message)}. ` +
				`Use mockSelect() to register an expectation first.`
		);
	}
	expect(args.message).toStrictEqual(exp.text);
	if (exp.options) {
		if (exp.options.choices !== undefined) {
			expect(args.choices).toStrictEqual(exp.options.choices);
		}
		if (exp.options.defaultOption !== undefined) {
			expect(args.defaultOption).toStrictEqual(exp.options.defaultOption);
		}
	}
	return exp.result;
}
