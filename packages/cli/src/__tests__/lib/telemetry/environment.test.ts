import { describe, expect, it } from "vite-plus/test";
import {
	getGlobalCliVersion,
	isDirectlyDelegated,
} from "../../../lib/telemetry/environment.js";

const PARENT_PID = 4242;

describe("isDirectlyDelegated", () => {
	it("is false without the sentinel", () => {
		expect(isDirectlyDelegated({}, PARENT_PID)).toBe(false);
		expect(isDirectlyDelegated({ CF_DELEGATION_PID: "4242" }, PARENT_PID)).toBe(
			false
		);
	});

	it("is true when the delegating process is this process's parent", () => {
		expect(
			isDirectlyDelegated(
				{ CF_DELEGATION: "1", CF_DELEGATION_PID: "4242" },
				PARENT_PID
			)
		).toBe(true);
	});

	it("is false for a process spawned below the delegated child", () => {
		expect(
			isDirectlyDelegated(
				{ CF_DELEGATION: "1", CF_DELEGATION_PID: "4242" },
				5151
			)
		).toBe(false);
	});

	it("trusts the sentinel alone from a global cf that predates the process ID", () => {
		expect(isDirectlyDelegated({ CF_DELEGATION: "1" }, PARENT_PID)).toBe(true);
	});
});

describe("getGlobalCliVersion", () => {
	const direct = {
		CF_DELEGATION: "1",
		CF_DELEGATING_CLI_VERSION: "1.0.0-beta.16",
		CF_DELEGATION_PID: "4242",
	};

	it("returns the version on a direct delegation", () => {
		expect(getGlobalCliVersion(direct, PARENT_PID)).toBe("1.0.0-beta.16");
	});

	it("omits the version for a process spawned below the delegated child", () => {
		expect(getGlobalCliVersion(direct, 5151)).toBeUndefined();
	});

	it("omits a version that arrives without the process ID", () => {
		const { CF_DELEGATION_PID: _pid, ...withoutPid } = direct;
		expect(getGlobalCliVersion(withoutPid, PARENT_PID)).toBeUndefined();
	});

	it("omits the version when the run was not delegated", () => {
		const { CF_DELEGATION: _sentinel, ...withoutSentinel } = direct;
		expect(getGlobalCliVersion(withoutSentinel, PARENT_PID)).toBeUndefined();
	});
});
