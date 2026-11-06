import { describe, expect, it } from "vite-plus/test";
import {
	FUTURE_OPTION_NAMES,
	flagOwnership,
	GLOBAL_OPTION_NAMES,
} from "../../lib/global-options.js";

describe("flagOwnership", () => {
	const owner = flagOwnership(["dry-run", "body", "force", "f"]);

	it.each(GLOBAL_OPTION_NAMES.filter((name) => name.length > 1))(
		"gives the global %s to cf",
		(name) => {
			expect(owner(name)).toBe("global");
		}
	);

	it.each([
		"temporaryAccount",
		"temporary_account",
		"persist.to",
		"EventCode",
		"Zone",
	])("compares %s kebab-normalized", (name) => {
		expect(owner(name)).toBe("global");
	});

	it.each(["q", "z", "m", "h", "v"])(
		"gives the global alias %s to cf",
		(name) => {
			expect(owner(name)).toBe("global");
		}
	);

	it.each(FUTURE_OPTION_NAMES)("reserves the future name %s", (name) => {
		expect(owner(name)).toBe("future");
	});

	it("reserves the experimental namespace, not the bare word", () => {
		expect(owner("experimental-gates")).toBe("experimental");
		expect(owner("experimental_gates")).toBe("experimental");
		expect(owner("experimental")).toBeUndefined();
	});

	it("reserves every other single letter", () => {
		expect(owner("n")).toBe("single-letter");
		expect(owner("N")).toBe("single-letter");
		expect(owner("nn")).toBeUndefined();
	});

	it("gives a command's own flags to cf only on that command", () => {
		expect(owner("dry_run")).toBe("command");
		expect(owner("body")).toBe("command");
		expect(flagOwnership([])("body")).toBeUndefined();
		expect(flagOwnership(["file"])("file")).toBe("command");
	});

	it.each(["preview", "yes", "output", "table", "text", "file", "mode-name"])(
		"lets an API field take %s",
		(name) => {
			expect(owner(name)).toBeUndefined();
		}
	);
});
