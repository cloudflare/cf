import path from "node:path";
import { getAuthFromEnv, validateProfileName } from "@cloudflare/workers-auth";
import { apiCommand } from "../../lib/api-command.js";
import { getProfileStore, login, logout } from "../../lib/oauth/index.js";
import { formatOutput, printSuccess } from "../../lib/output.js";
import { savedProfiles } from "../../lib/profile-completions.js";
import { theme } from "../../lib/ui/index.js";
import { log } from "../../lib/ui/log.js";
import type { CommonYargsOptions } from "../../lib/cli-types.js";

export function assertNoProfileFlag(
	args: Pick<CommonYargsOptions, "profile">,
	command: string,
	usage?: string
): void {
	if (!args.profile) {
		return;
	}

	const suffix = usage ? ` ${usage}` : "";
	throw new Error(
		`The --profile flag cannot be used with \`cf auth ${command}\`.${suffix}`
	);
}

function assertNoEnvCredentials(): void {
	if (getAuthFromEnv({ allowGlobalAuthKey: false }) === undefined) {
		return;
	}

	throw new Error(
		"Cannot manage auth profiles while CLOUDFLARE_API_TOKEN is set. Unset CLOUDFLARE_API_TOKEN and try again."
	);
}

export const createCommand = apiCommand({
	command: "create <name>",
	describe: "Create or re-authenticate a named auth profile",
	flags: {
		browser: {
			kind: "boolean",
			brief:
				"Open the authorization link in a browser (use --no-browser to print it instead)",
			default: true,
		},
		device: {
			kind: "boolean",
			brief:
				"Use OAuth device authorization (use --no-device for the localhost callback flow)",
			default: true,
		},
		scopes: {
			kind: "parsed",
			parse: String,
			brief: "The set of OAuth scopes to request",
			optional: true,
			variadic: true,
		},
	},
	operands: [
		{
			placeholder: "name",
			parse: String,
			brief: "Name for the auth profile",
			proposeCompletions: (partial) => savedProfiles(partial, false),
		},
	],
	profileCompletion: false,
	async handler(argv) {
		assertNoProfileFlag(
			argv,
			"create",
			"Pass the profile name as the command argument: `cf auth create <name>`."
		);
		assertNoEnvCredentials();
		validateProfileName(argv.name);

		const profiles = getProfileStore();
		const isUpdate = profiles.configs.exists(argv.name);

		await login({
			browser: argv.browser,
			device: argv.device,
			scopes: argv.scopes,
			profile: argv.name,
		});

		printSuccess(
			isUpdate
				? `Profile "${argv.name}" re-authenticated.`
				: `Profile "${argv.name}" created.`
		);
		log.info(
			"To use this profile in a directory, run:",
			`cf auth activate ${argv.name}`
		);
	},
});

export const deleteCommand = apiCommand({
	command: "delete <name>",
	describe: "Delete a named auth profile",
	flags: {},
	operands: [
		{
			placeholder: "name",
			parse: String,
			brief: "Name of the auth profile to delete",
			proposeCompletions: (partial) => savedProfiles(partial, false),
		},
	],
	profileCompletion: false,
	async handler(argv) {
		assertNoProfileFlag(argv, "delete");
		assertNoEnvCredentials();
		validateProfileName(argv.name);

		const profiles = getProfileStore();
		if (!profiles.configs.exists(argv.name)) {
			throw new Error(`Profile "${argv.name}" does not exist.`);
		}

		const removedBindings = profiles.bindings.removeAllBindingsForProfile(
			argv.name
		);
		if (removedBindings.length > 0) {
			log.info(
				[
					"Removed directory bindings:",
					...removedBindings.map((dir) => `  ${dir}`),
				].join("\n")
			);
		}

		await logout(argv.name);
		profiles.configs.delete(argv.name);
		printSuccess(`Profile "${argv.name}" deleted.`);

		const currentProfile = profiles.bindings.getProfileForDirectory(
			process.cwd()
		);
		if (currentProfile) {
			log.info(`Active profile for this directory: ${currentProfile}.`);
		} else if (profiles.configs.exists("default")) {
			log.info("This directory now uses the default profile.");
		} else {
			log.info(
				`No active profile for this directory. Run ${theme.code("cf auth login")} to set up the default profile, or ${theme.code("cf auth create <name>")} to create a named profile.`
			);
		}
	},
});

export const activateCommand = apiCommand({
	command: "activate <name> [dir]",
	describe: "Bind a named auth profile to a directory",
	flags: {},
	operands: [
		{
			placeholder: "name",
			parse: String,
			brief: "Name of the auth profile to activate",
			proposeCompletions: (partial) => savedProfiles(partial, false),
		},
		{
			placeholder: "dir",
			parse: String,
			brief: "Directory to bind the profile to (defaults to current directory)",
			optional: true,
		},
	],
	profileCompletion: false,
	handler(argv) {
		assertNoProfileFlag(
			argv,
			"activate",
			"Pass the profile name as the command argument: `cf auth activate <name>`."
		);
		assertNoEnvCredentials();
		validateProfileName(argv.name);

		const profiles = getProfileStore();
		if (!profiles.configs.exists(argv.name)) {
			throw new Error(
				`Profile "${argv.name}" does not exist. Run \`cf auth create ${argv.name}\` first.`
			);
		}

		const targetDir = argv.dir ?? process.cwd();
		profiles.bindings.activate(argv.name, targetDir);
		printSuccess(
			`Profile "${argv.name}" activated for "${path.resolve(targetDir)}".`
		);
	},
});

export const deactivateCommand = apiCommand({
	command: "deactivate [dir]",
	describe: "Remove the auth profile binding from a directory",
	flags: {},
	operands: [
		{
			placeholder: "dir",
			parse: String,
			brief:
				"Directory to unbind (defaults to current directory). Must be the exact directory the profile was bound to.",
			optional: true,
		},
	],
	profileCompletion: false,
	handler(argv) {
		assertNoProfileFlag(argv, "deactivate");
		assertNoEnvCredentials();

		const profiles = getProfileStore();
		const targetDir = argv.dir ?? process.cwd();
		const { removedProfile, newResolution } =
			profiles.bindings.deactivate(targetDir);

		printSuccess(
			`Profile "${removedProfile}" deactivated from "${path.resolve(targetDir)}".`
		);
		if (newResolution.profile === undefined) {
			log.info(
				`Run ${theme.code("cf auth login")} to set up the default profile, or ${theme.code("cf auth create <name>")} to create a named profile.`
			);
		} else if (newResolution.profile === "default") {
			log.info("This directory now uses the default profile.");
		} else {
			log.info(
				`Now using: ${newResolution.profile} (${newResolution.source}).`
			);
		}
	},
});

export const listCommand = apiCommand({
	command: "list",
	describe: "List all auth profiles",
	flags: {},
	operands: [],
	profileCompletion: false,
	handler(argv) {
		assertNoProfileFlag(argv, "list");
		const profiles = getProfileStore();
		const bindings = profiles.bindings.read();
		const bindingsByProfile: Record<string, string[]> = {};

		for (const [dir, profile] of Object.entries(bindings)) {
			(bindingsByProfile[profile] ??= []).push(dir);
		}

		formatOutput(
			profiles.configs.list().map((name) => ({
				name,
				boundDirectories: bindingsByProfile[name] ?? [],
			}))
		);
	},
});
