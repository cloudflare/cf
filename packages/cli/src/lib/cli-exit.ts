/**
 * Thrown in place of `process.exit()` so callers and tests can inspect the
 * requested exit code. The binary entry point maps it back to `process.exit()`.
 */
export class CliExit extends Error {
	public readonly signal?: NodeJS.Signals;
	public readonly cancelled: boolean;

	constructor(
		public readonly code: number,
		options: { signal?: NodeJS.Signals; cancelled?: boolean } = {}
	) {
		super(`CliExit(${code})`);
		this.name = "CliExit";
		this.signal = options.signal;
		this.cancelled = options.cancelled ?? false;
	}
}
