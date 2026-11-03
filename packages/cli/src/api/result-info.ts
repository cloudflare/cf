const resultInfo = new WeakMap<object, unknown>();

/** Keep envelope metadata without changing the payload shape callers consume. */
export function withResultInfo<T>(result: T, info: unknown): T {
	if (result !== null && typeof result === "object" && info !== undefined) {
		resultInfo.set(result, info);
	}
	return result;
}

export function getResultInfo(result: unknown): unknown {
	return result !== null && typeof result === "object"
		? resultInfo.get(result)
		: undefined;
}
