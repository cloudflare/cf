import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import t from "@bomb.sh/tab";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import {
	SHELLS,
	getScriptPath,
	getSourceLine,
	installScript,
	refreshInstalledScripts,
	renderScript,
} from "../../commands/completions/install.js";
import { captureOutput } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

function printedScript(shell: (typeof SHELLS)[number]): string {
	const lines: string[] = [];
	const spy = vi.spyOn(console, "log").mockImplementation((line) => {
		lines.push(`${String(line)}\n`);
	});
	t.setup("cf", "cf", shell);
	spy.mockRestore();
	return lines.join("");
}

describe("installed completion scripts", () => {
	runInTempDir();

	it.each(SHELLS)("renders the %s script cf complete prints", (shell) => {
		const log = console.log;
		expect(renderScript(shell)).toBe(printedScript(shell));
		expect(console.log).toBe(log);
	});

	it("installs scripts under cf's config directory", () => {
		const path = installScript("zsh");

		expect(path).toBe(join(getCfConfigPath(), "completions", "cf.zsh"));
		expect(readFileSync(path, "utf-8")).toBe(renderScript("zsh"));
		expect(getScriptPath("powershell")).toBe(
			join(getCfConfigPath(), "completions", "cf.ps1")
		);
	});

	it("refreshes stale installed scripts and leaves others uninstalled", () => {
		const path = installScript("bash");
		writeFileSync(path, "stale\n");

		refreshInstalledScripts();

		expect(readFileSync(path, "utf-8")).toBe(renderScript("bash"));
		for (const shell of ["zsh", "fish", "powershell"] as const) {
			expect(existsSync(getScriptPath(shell))).toBe(false);
		}
	});

	it("removes the temp file when a write fails", () => {
		const path = getScriptPath("zsh");
		mkdirSync(path, { recursive: true });

		expect(() => installScript("zsh")).toThrow();
		expect(readdirSync(dirname(path))).toEqual(["cf.zsh"]);
	});

	it("quotes the rc line for each shell", () => {
		const path = "/home/o'brien/cf.sh";

		expect(getSourceLine("zsh", path)).toBe("source '/home/o'\\''brien/cf.sh'");
		expect(getSourceLine("bash", path)).toBe(
			"source '/home/o'\\''brien/cf.sh'"
		);
		expect(getSourceLine("fish", "C:\\o'brien\\cf.fish")).toBe(
			"source 'C:\\\\o\\'brien\\\\cf.fish'"
		);
		expect(getSourceLine("powershell", "C:\\o'brien\\cf.ps1")).toBe(
			". 'C:\\o''brien\\cf.ps1'"
		);
	});
});

describe("cf complete --install", () => {
	runInTempDir();
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("writes the script and prints its path", async () => {
		await runCf(["complete", "zsh", "--install"]);

		const path = getScriptPath("zsh");
		expect(output.stdout()).toBe(path);
		expect(readFileSync(path, "utf-8")).toBe(renderScript("zsh"));
		expect(output.stderr()).toContain(getSourceLine("zsh", path));
	});

	it("still prints the script without --install", async () => {
		await runCf(["complete", "fish"]);

		expect(`${output.stdout()}\n`).toBe(renderScript("fish"));
		expect(existsSync(getScriptPath("fish"))).toBe(false);
	});

	it("refreshes installed scripts on TAB callbacks", async () => {
		const path = installScript("zsh");
		writeFileSync(path, "stale\n");

		await runCf(["complete", "--", "dn"]);

		expect(readFileSync(path, "utf-8")).toBe(renderScript("zsh"));
		expect(output.stdout()).toContain("dns");
	});
});
