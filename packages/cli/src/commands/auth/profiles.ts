import path from "node:path";
import { getAuthFromEnv, validateProfileName } from "@cloudflare/workers-auth";
import { getProfileStore, login, logout } from "../../lib/auth.js";
import { formatOutput } from "../../lib/output.js";
import { hint, info, theme } from "../../lib/ui/index.js";
import type { CommonYargsOptions } from "../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface CreateArgs extends CommonYargsOptions {
	name: string;
	browser?: boolean;
	device?: boolean;
	scopes?: string[];
}

interface NamedProfileArgs extends CommonYargsOptions {
	name: string;
}

interface ActivateArgs extends NamedProfileArgs {
	dir?: string;
}

interface DeactivateArgs extends CommonYargsOptions {
	dir?: string;
}

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

export const createCommand: CommandModule<object, CreateArgs> = {
	command: "create <name>",
	describe: "Create or re-authenticate a named auth profile",

	builder: (yargs: Argv): Argv<CreateArgs> =>
		yargs
			.positional("name", {
				type: "string",
				description: "Name for the auth profile",
				demandOption: true,
			})
			.option("browser", {
				type: "boolean",
				description:
					"Open the authorization link in a browser (use --no-browser to print it instead)",
				default: true,
			})
			.option("device", {
				type: "boolean",
				description:
					"Use OAuth device authorization (use --no-device for the localhost callback flow)",
				default: true,
			})
			.option("scopes", {
				type: "string",
				array: true,
				description: "The set of OAuth scopes to request",
			}) as Argv<CreateArgs>,

	handler: async (argv: ArgumentsCamelCase<CreateArgs>): Promise<void> => {
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

		console.log(
			info(
				isUpdate
					? `Profile "${argv.name}" re-authenticated.`
					: `Profile "${argv.name}" created.`
			)
		);
		console.log(
			hint(
				`Run ${theme.code(`cf auth activate ${argv.name}`)} to use this profile in a directory.`
			)
		);
	},
};

export const deleteCommand: CommandModule<object, NamedProfileArgs> = {
	command: "delete <name>",
	describe: "Delete a named auth profile",

	builder: (yargs: Argv): Argv<NamedProfileArgs> =>
		yargs.positional("name", {
			type: "string",
			description: "Name of the auth profile to delete",
			demandOption: true,
		}) as Argv<NamedProfileArgs>,

	handler: async (
		argv: ArgumentsCamelCase<NamedProfileArgs>
	): Promise<void> => {
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
			console.log(info("Removed directory bindings:"));
			for (const dir of removedBindings) {
				console.log(`  ${dir}`);
			}
		}

		await logout(argv.name);
		profiles.configs.delete(argv.name);
		console.log(info(`Profile "${argv.name}" deleted.`));

		const currentProfile = profiles.bindings.getProfileForDirectory(
			process.cwd()
		);
		if (currentProfile) {
			console.log(
				info(`Active profile for this directory: ${currentProfile}.`)
			);
		} else if (profiles.configs.exists("default")) {
			console.log(info("This directory now uses the default profile."));
		} else {
			console.log(
				hint(
					`No active profile for this directory. Run ${theme.code("cf auth login")} to set up the default profile, or ${theme.code("cf auth create <name>")} to create a named profile.`
				)
			);
		}
	},
};

export const activateCommand: CommandModule<object, ActivateArgs> = {
	command: "activate <name> [dir]",
	describe: "Bind a named auth profile to a directory",

	builder: (yargs: Argv): Argv<ActivateArgs> =>
		yargs
			.positional("name", {
				type: "string",
				description: "Name of the auth profile to activate",
				demandOption: true,
			})
			.positional("dir", {
				type: "string",
				description:
					"Directory to bind the profile to (defaults to current directory)",
			}) as Argv<ActivateArgs>,

	handler: (argv: ArgumentsCamelCase<ActivateArgs>): void => {
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
		console.log(
			info(`Profile "${argv.name}" activated for "${path.resolve(targetDir)}".`)
		);
	},
};

export const deactivateCommand: CommandModule<object, DeactivateArgs> = {
	command: "deactivate [dir]",
	describe: "Remove the auth profile binding from a directory",

	builder: (yargs: Argv): Argv<DeactivateArgs> =>
		yargs.positional("dir", {
			type: "string",
			description:
				"Directory to unbind (defaults to current directory). Must be the exact directory the profile was bound to.",
		}) as Argv<DeactivateArgs>,

	handler: (argv: ArgumentsCamelCase<DeactivateArgs>): void => {
		assertNoProfileFlag(argv, "deactivate");
		assertNoEnvCredentials();

		const profiles = getProfileStore();
		const targetDir = argv.dir ?? process.cwd();
		const { removedProfile, newResolution } =
			profiles.bindings.deactivate(targetDir);

		console.log(
			info(
				`Profile "${removedProfile}" deactivated from "${path.resolve(targetDir)}".`
			)
		);
		if (newResolution.profile === undefined) {
			console.log(
				hint(
					`Run ${theme.code("cf auth login")} to set up the default profile, or ${theme.code("cf auth create <name>")} to create a named profile.`
				)
			);
		} else if (newResolution.profile === "default") {
			console.log(info("This directory now uses the default profile."));
		} else {
			console.log(
				info(`Now using: ${newResolution.profile} (${newResolution.source}).`)
			);
		}
	},
};

export const listCommand: CommandModule<object, CommonYargsOptions> = {
	command: "list",
	describe: "List all auth profiles",

	handler: (argv: ArgumentsCamelCase<CommonYargsOptions>): void => {
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
};
