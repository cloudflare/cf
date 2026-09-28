import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getGlobalDispatcher, MockAgent, setGlobalDispatcher } from "undici";
import { afterAll, beforeAll, beforeEach, describe, it, vi } from "vitest";
import { getProfileStore } from "../../../cli/src/lib/oauth/index";
import { mockConsoleMethods } from "./helpers/mock-console";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

function profiles() {
	return getProfileStore();
}

function profileConfigPath(name: string): string {
	const configRoot = process.env.XDG_CONFIG_HOME
		? path.join(process.env.XDG_CONFIG_HOME, "cloudflare")
		: path.join(os.homedir(), ".config", "cloudflare");
	return path.join(configRoot, "config", `${name}.json`);
}

function createProfileFile(name: string, token = `${name}-token`): void {
	const configPath = profileConfigPath(name);
	mkdirSync(path.dirname(configPath), { recursive: true });
	writeFileSync(
		configPath,
		JSON.stringify({
			oauth_token: token,
			refresh_token: "test-refresh",
			expiration_time: "2999-01-01T00:00:00.000Z",
		})
	);
}

function createDeprecatedProfileFile(name: string): void {
	const configPath = profileConfigPath(name);
	mkdirSync(path.dirname(configPath), { recursive: true });
	writeFileSync(configPath, JSON.stringify({ api_token: "legacy-token" }));
}

describe("Profiles", () => {
	runInTempDir();
	const std = mockConsoleMethods();
	const mockAgent = new MockAgent();
	const previousDispatcher = getGlobalDispatcher();

	beforeEach(() => {
		// Profile management is unavailable when environment credentials are
		// present. Keep the suite independent of the invoking shell; individual
		// tests opt back into the variable when exercising that behaviour.
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
	});

	beforeAll(() => {
		mockAgent.disableNetConnect();
		mockAgent
			.get("https://dash.cloudflare.com")
			.intercept({ path: "/oauth2/revoke", method: "POST" })
			.reply(200, "")
			.persist();
		setGlobalDispatcher(mockAgent);
	});

	afterAll(async () => {
		setGlobalDispatcher(previousDispatcher);
		await mockAgent.close();
	});

	describe("validateProfileName", () => {
		it("rejects reserved names", async ({ expect }) => {
			for (const name of ["default", "staging", "Default"]) {
				await expect(runWrangler(`auth create ${name}`)).rejects.toThrow(
					/reserved profile name/
				);
			}
		});

		it("rejects names with invalid characters", async ({ expect }) => {
			for (const name of ["'my profile'", "my.profile", "my../profile"]) {
				await expect(runWrangler(`auth create ${name}`)).rejects.toThrow(
					/may only contain/
				);
			}
		});

		it("accepts valid profile names", ({ expect }) => {
			for (const name of ["my-profile", "my_profile", "client1", "WORK"]) {
				expect(() =>
					profiles().resolve({ profile: name, cwd: process.cwd() })
				).not.toThrow();
			}
		});
	});

	describe("prefix matching", () => {
		it("most specific (longest) match wins", ({ expect }) => {
			const parentDir = path.resolve("projects");
			const childDir = path.join(parentDir, "app");
			profiles().bindings.activate("parent", parentDir);
			profiles().bindings.activate("child", childDir);

			expect(profiles().bindings.getProfileForDirectory(childDir)).toBe(
				"child"
			);
			expect(
				profiles().bindings.getProfileForDirectory(path.join(childDir, "src"))
			).toBe("child");
			expect(
				profiles().bindings.getProfileForDirectory(
					path.join(parentDir, "other")
				)
			).toBe("parent");
		});

		it("does not match at non-path boundary", ({ expect }) => {
			const dir = path.resolve("projects/client-a");
			profiles().bindings.activate("client-a", dir);
			expect(
				profiles().bindings.getProfileForDirectory(`${dir}-other`)
			).toBeUndefined();
		});
	});

	describe("resolveProfile", () => {
		it("--profile flag takes priority over directory binding", ({ expect }) => {
			profiles().bindings.activate("dir-profile", process.cwd());
			expect(
				profiles().resolve({
					profile: "flag-profile",
					cwd: process.cwd(),
				})
			).toBe("flag-profile");
		});

		it("rejects invalid profile names from --profile flag", ({ expect }) => {
			for (const profile of ["../../../etc/passwd", "my profile"]) {
				expect(() =>
					profiles().resolve({ profile, cwd: process.cwd() })
				).toThrow(/may only contain/);
			}
		});

		it("--profile default resolves to the default profile", ({ expect }) => {
			profiles().bindings.activate("dir-profile", process.cwd());
			expect(
				profiles().resolve({ profile: "default", cwd: process.cwd() })
			).toBe("default");
		});
	});

	describe("wrangler auth create", () => {
		it("validates name", async ({ expect }) => {
			await expect(runWrangler("auth create default")).rejects.toThrow(
				/reserved profile name/
			);
		});

		it("rejects --profile", async ({ expect }) => {
			await expect(
				runWrangler("auth create client-a --profile other")
			).rejects.toThrow(/--profile flag cannot be used with `cf auth create`/);
		});

		it("errors without creating a profile when env credentials are set", async ({
			expect,
		}) => {
			await expect(
				runWrangler("auth create client-a", {
					CLOUDFLARE_API_TOKEN: "env-token",
				})
			).rejects.toThrow(/Cannot manage auth profiles/);
			expect(profiles().configs.exists("client-a")).toBe(false);
		});

		it.todo("creates a new profile via OAuth login");
		it.todo("re-authenticates an existing profile");
	});

	describe("wrangler auth delete", () => {
		it("validates name", async ({ expect }) => {
			await expect(runWrangler("auth delete default")).rejects.toThrow(
				/reserved profile name/
			);
		});

		it("errors when profile does not exist", async ({ expect }) => {
			await expect(runWrangler("auth delete nonexistent")).rejects.toThrow(
				/does not exist/
			);
		});

		it("errors without deleting a profile when env credentials are set", async ({
			expect,
		}) => {
			const dir = path.resolve("projects/client-a");
			createProfileFile("client-a");
			profiles().bindings.activate("client-a", dir);

			await expect(
				runWrangler("auth delete client-a", {
					CLOUDFLARE_API_TOKEN: "env-token",
				})
			).rejects.toThrow(/Cannot manage auth profiles/);
			expect(profiles().configs.exists("client-a")).toBe(true);
			expect(profiles().bindings.getBindingsForProfile("client-a")).toEqual([
				dir,
			]);
		});

		it("deletes a profile and its directory bindings", async ({ expect }) => {
			const dirA = path.resolve("projects/client-a");
			const dirB = path.resolve("projects/client-a-v2");
			createProfileFile("client-a");
			profiles().bindings.activate("client-a", dirA);
			profiles().bindings.activate("client-a", dirB);

			await runWrangler("auth delete client-a");

			expect(profiles().configs.exists("client-a")).toBe(false);
			expect(profiles().bindings.getBindingsForProfile("client-a")).toEqual([]);
			expect(std.out).toContain("Removed directory bindings:");
			expect(std.out).toContain("projects/client-a");
			expect(std.out).toContain("projects/client-a-v2");
		});

		it("deletes a profile file when logout returns before clearing storage", async ({
			expect,
		}) => {
			createDeprecatedProfileFile("client-a");
			await runWrangler("auth delete client-a");
			expect(profiles().configs.exists("client-a")).toBe(false);
			expect(std.out).toContain('Profile "client-a" deleted.');
		});

		it("falls back to ancestor profile after deleting a child profile", async ({
			expect,
		}) => {
			const parentDir = path.resolve("projects");
			const childDir = path.join(parentDir, "app");
			createProfileFile("parent-profile");
			createProfileFile("child-profile");
			profiles().bindings.activate("parent-profile", parentDir);
			profiles().bindings.activate("child-profile", childDir);

			await runWrangler("auth delete child-profile");
			expect(
				profiles().bindings.getProfileForDirectory(path.join(childDir, "src"))
			).toBe("parent-profile");
		});
	});

	describe("wrangler auth activate", () => {
		it("errors when profile does not exist", async ({ expect }) => {
			await expect(runWrangler("auth activate nonexistent")).rejects.toThrow(
				/does not exist.*cf auth create nonexistent/
			);
		});

		it("rejects --profile", async ({ expect }) => {
			await expect(
				runWrangler("auth activate client-a --profile other")
			).rejects.toThrow(
				/--profile flag cannot be used with `cf auth activate`/
			);
		});

		it("errors without activating a profile when env credentials are set", async ({
			expect,
		}) => {
			createProfileFile("client-a");
			await expect(
				runWrangler("auth activate client-a", {
					CLOUDFLARE_API_TOKEN: "env-token",
				})
			).rejects.toThrow(/Cannot manage auth profiles/);
			expect(
				profiles().bindings.getProfileForDirectory(process.cwd())
			).toBeUndefined();
		});

		it("binds a profile to the current directory", async ({ expect }) => {
			createProfileFile("client-a");
			await runWrangler("auth activate client-a");
			expect(profiles().bindings.getProfileForDirectory(process.cwd())).toBe(
				"client-a"
			);
		});

		it("binds a profile to a specified directory", async ({ expect }) => {
			const targetDir = path.resolve("projects/client-a");
			createProfileFile("client-a");
			await runWrangler(`auth activate client-a ${targetDir}`);
			expect(profiles().bindings.getProfileForDirectory(targetDir)).toBe(
				"client-a"
			);
		});
	});

	describe("wrangler auth deactivate", () => {
		it("errors when no binding exists for current directory", async ({
			expect,
		}) => {
			await expect(runWrangler("auth deactivate")).rejects.toThrow(
				/No profile is .*bound/
			);
		});

		it("rejects --profile", async ({ expect }) => {
			await expect(
				runWrangler("auth deactivate --profile other")
			).rejects.toThrow(
				/--profile flag cannot be used with `cf auth deactivate`/
			);
		});

		it("errors without deactivating a profile when env credentials are set", async ({
			expect,
		}) => {
			createProfileFile("client-a");
			profiles().bindings.activate("client-a", process.cwd());
			await expect(
				runWrangler("auth deactivate", {
					CLOUDFLARE_API_TOKEN: "env-token",
				})
			).rejects.toThrow(/Cannot manage auth profiles/);
			expect(profiles().bindings.getProfileForDirectory(process.cwd())).toBe(
				"client-a"
			);
		});

		it("errors when run from a subdirectory of a bound directory", async ({
			expect,
		}) => {
			const targetDir = path.resolve("projects/client-a");
			const subDir = path.join(targetDir, "sub");
			createProfileFile("client-a");
			profiles().bindings.activate("client-a", targetDir);
			await expect(runWrangler(`auth deactivate ${subDir}`)).rejects.toThrow(
				/No profile is directly bound/
			);
		});

		it("deactivates a profile and falls back to default", async ({
			expect,
		}) => {
			createProfileFile("default");
			createProfileFile("client-a");
			profiles().bindings.activate("client-a", process.cwd());
			await runWrangler("auth deactivate");
			expect(
				profiles().bindings.getProfileForDirectory(process.cwd())
			).toBeUndefined();
			expect(std.out).toContain("This directory now uses the default profile.");
		});

		it("shows no active profile when logged out globally", async ({
			expect,
		}) => {
			createProfileFile("client-a");
			profiles().bindings.activate("client-a", process.cwd());
			await runWrangler("auth deactivate");
			expect(std.out).toContain(
				"Run cf auth login to set up the default profile"
			);
		});
	});

	describe("wrangler auth list", () => {
		it("shows message when no profiles exist", async ({ expect }) => {
			await runWrangler("auth list");
			expect(JSON.parse(std.out)).toEqual([]);
		});

		it("lists profiles with bound directories", async ({ expect }) => {
			const targetDir = path.resolve("projects/client-a");
			createProfileFile("default");
			createProfileFile("client-a");
			profiles().bindings.activate("client-a", targetDir);
			await runWrangler("auth list");
			const listed = JSON.parse(std.out) as Array<{
				name: string;
				boundDirectories: string[];
			}>;
			expect(listed.find(({ name }) => name === "default")).toEqual({
				name: "default",
				boundDirectories: [],
			});
			expect(
				listed.find(({ name }) => name === "client-a")?.boundDirectories[0]
			).toContain("projects/client-a");
		});
	});

	describe("wrangler auth token", () => {
		it.todo("outputs the token for the specified profile");
		it.todo("outputs the default profile token when no --profile is specified");
		it.todo("respects directory-bound profile for auth token");
		it.todo("--profile flag overrides directory binding");
	});

	describe("banner profile resolution", () => {
		// cf emits its banner once per process, rather than once per command, and
		// does not use Wrangler config/cwd flags for profile resolution.
		it.skip("shows active profile in the banner for non-auth commands");
		it.skip("does not show active profile in the banner for auth commands");
		it.skip(
			"does not show active profile when env credentials override profiles"
		);
		it.skip("resolves profile from --config directory");
		it.skip("resolves profile from --cwd directory");
		it.skip("inherits profile from ancestor directory");
	});

	describe("keyring-encrypted named profiles", () => {
		it.todo("`auth create` stores a named profile encrypted, not as plaintext");
		it.todo(
			"an encrypted named profile is visible to `exists()` and `auth list`"
		);
		it.todo("`auth activate` works for an encrypted named profile");
		it.todo(
			"`auth delete` removes the encrypted file and the profile's keyring entry"
		);
		it.todo(
			"deleting one encrypted profile leaves another profile's keyring entry intact"
		);
		it.todo("`auth keyring disable` scrubs encrypted named profiles globally");
	});
});
