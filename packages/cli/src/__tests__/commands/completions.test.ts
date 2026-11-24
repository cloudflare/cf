import { describe, expect, it } from "vite-plus/test";
import { buildCli } from "../../index.js";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";
const values = async (...words: string[]) =>
	(await buildCli([]).cli.complete(words)).map((entry) => entry.completion);
describe("parser-backed completions", () => {
	const output = mockOutputStreams();
	it.each([
		["bash", "complete -F __cf_complete cf"],
		["zsh", "compdef _cf cf"],
		["fish", "complete -c cf"],
		["powershell", "Register-ArgumentCompleter"],
	])("keeps the %s shell integration", async (shell, registration) => {
		expect(await runCf(["complete", shell])).toEqual({ exitCode: 0 });
		expect(output.out).toContain(registration);
	});
	it("writes shell candidates and the no-file-completion directive", async () => {
		await runCf(["complete", "--", "zones", "list", "--direction", "d"]);
		expect(output.out).toBe("desc\tdesc\n:4");
	});
	it("follows routes, including command aliases", async () => {
		expect(await values("access", "s")).toEqual(
			expect.arrayContaining(["ssh", "smb"])
		);
	});
	it("suggests real flags on aliased routes", async () => {
		expect((await values("access", "ssh", "--log")).sort()).toEqual(
			["--log-level", "--loglevel"].sort()
		);
	});
	it("completes enum values in either shell spelling", async () => {
		for (const words of [["--direction", "d"], ["--direction=d"]]) {
			expect(await values("zones", "list", ...words)).toEqual(["desc"]);
		}
	});
	it("resolves global options before the route and excludes hidden flags", async () => {
		expect(await values("--profile", "work", "zones", "li")).toContain("list");
		expect(await values("zones", "list", "--temp")).not.toContain(
			"--temporary-account"
		);
	});
});
