/**
 * Vitest alias target for `@clack/prompts`. Self-contained — does NOT
 * re-import the real package (we'd alias-resolve back to ourselves).
 *
 * cf uses these clack APIs: `intro`, `confirm`, `text`, `password`,
 * `select`. The interactive ones consume from the shared mock-dialogs
 * queues populated by `mockConfirm`/`mockPrompt`/`mockSelect`. `intro`
 * is a no-op (tests don't assert on it).
 */
import {
	_consumeConfirm,
	_consumePrompt,
	_consumeSelect,
} from "./mock-dialogs";

export function intro(_message?: string): void {
	// no-op: tests don't assert on the intro banner.
}

export function outro(_message?: string): void {
	// no-op
}

export function confirm(opts: { message: string; initialValue?: boolean }) {
	return Promise.resolve(
		_consumeConfirm({ message: opts.message, defaultValue: opts.initialValue })
	);
}

export function text(opts: { message: string; defaultValue?: string }) {
	return Promise.resolve(
		_consumePrompt({
			message: opts.message,
			defaultValue: opts.defaultValue,
			isSecret: false,
		})
	);
}

export function password(opts: { message: string }) {
	return Promise.resolve(
		_consumePrompt({ message: opts.message, isSecret: true })
	);
}

export function select(opts: {
	message: string;
	options?: unknown;
	initialValue?: unknown;
}) {
	return Promise.resolve(
		_consumeSelect({ message: opts.message, choices: opts.options })
	);
}

// `isCancel` is imported by cf from `@clack/core` (not /prompts), so it's
// not aliased here. cf re-checks it on prompt results — our mocks always
// return non-cancel values, so the real isCancel will simply return false.

// Stubs for any other clack export cf might add later. If you hit one
// of these and need a real impl, add it here rather than removing the
// alias.
export const note = (_msg?: string) => {};
export const log = {
	info: (_msg?: string) => {},
	success: (_msg?: string) => {},
	warn: (_msg?: string) => {},
	warning: (_msg?: string) => {},
	error: (_msg?: string) => {},
	step: (_msg?: string) => {},
	message: (_msg?: string) => {},
};
// Mirror @clack/prompts' `SpinnerResult` surface. cf's `withProgress`
// calls `s.error()` on the failure path (lib/progress.ts), so a stub
// missing it surfaces as `TypeError: s.error is not a function` and
// masks the real error the test is asserting on.
export const spinner = () => ({
	start: (_msg?: string) => {},
	stop: (_msg?: string) => {},
	cancel: (_msg?: string) => {},
	error: (_msg?: string) => {},
	message: (_msg?: string) => {},
	clear: () => {},
	isCancelled: false,
});
