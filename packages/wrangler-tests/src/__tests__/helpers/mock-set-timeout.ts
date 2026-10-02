import { afterEach, beforeEach, vi } from "vite-plus/test";
import type { MockInstance } from "vite-plus/test";

let setTimeoutSpy: MockInstance;

export function mockSetTimeout() {
	beforeEach(() => {
		setTimeoutSpy = vi
			.spyOn(global, "setTimeout")
			// @ts-expect-error we're using a very simple setTimeout mock here
			.mockImplementation((fn, _period) => {
				setImmediate(fn);
			});
	});

	afterEach(() => {
		setTimeoutSpy.mockRestore();
	});
}
