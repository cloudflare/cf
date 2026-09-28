import { describe, expect, it } from "vitest";
import { hasQuietFlag } from "../../lib/args.js";

describe("hasQuietFlag", () => {
	it.each(["--quiet", "-q", "--quiet=true", "-q=true"])(
		"recognizes %s",
		(flag) => {
			expect(hasQuietFlag([flag])).toBe(true);
		}
	);

	it.each([
		["--quiet=false"],
		["-q=false"],
		["--quiet", "false"],
		["-q", "false"],
		["--no-quiet"],
	])("ignores %s", (...argv) => {
		expect(hasQuietFlag(argv)).toBe(false);
	});

	it("uses the last quiet value", () => {
		expect(hasQuietFlag(["--quiet", "--quiet=false"])).toBe(false);
		expect(hasQuietFlag(["--quiet=false", "--quiet"])).toBe(true);
	});
});
