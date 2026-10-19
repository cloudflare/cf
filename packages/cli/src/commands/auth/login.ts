import { getAuthFromEnv } from "@cloudflare/workers-auth";
import {
	getActiveProfile,
	getConfigPath,
	getValidToken,
	isOAuthLoggedIn,
	login,
	readAuthCredentials,
	setProfile,
} from "../../lib/oauth/index.js";
import { theme } from "../../lib/ui/index.js";
import { log, printCommands } from "../../lib/ui/log.js";
import { assertNoProfileFlag } from "./profiles.js";
import type { CommonYargsOptions } from "../../lib/cli-types.js";
import type { ArgClassification } from "../../lib/telemetry/index.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface LoginArgs extends CommonYargsOptions {
	force?: boolean;
	browser?: boolean;
	device?: boolean;
	scopes?: string[];
}

const MAX_INLINE_SCOPES = 5;

export const loginTelemetryClassification: ArgClassification<LoginArgs> = {
	safeFlags: ["force", "browser", "device"],
	shortFlagAliases: {
		f: { canonical: "force", type: "boolean" },
	},
};

const loginCommand: CommandModule<object, LoginArgs> = {
	command: "login",
	describe: "Authenticate with Cloudflare",

	builder: (yargs: Argv): Argv<LoginArgs> => {
		return yargs
			.option("force", {
				type: "boolean",
				alias: "f",
				description: "Force re-authentication even if already logged in",
				default: false,
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
			}) as Argv<LoginArgs>;
	},

	handler: async (argv: ArgumentsCamelCase<LoginArgs>): Promise<void> => {
		assertNoProfileFlag(
			argv,
			"login",
			"Run `cf auth create <name>` to authenticate a named profile."
		);

		const activeProfile = getActiveProfile();

		if (activeProfile !== "default") {
			log.warn(
				`This directory has profile "${activeProfile}" active. ${theme.code("cf auth login")} updates the default profile, not "${activeProfile}". To re-authenticate "${activeProfile}", run:`
			);
			printCommands(`cf auth create ${activeProfile}`);
		}

		setProfile("default");

		if (!argv.force && isOAuthLoggedIn()) {
			// Verify the stored tokens actually work, refreshing if needed.
			const validToken = await getValidToken();
			if (validToken) {
				const state = readAuthCredentials();
				const lines = [
					"You are already logged in.",
					`${theme.info("Config file:")} ${theme.muted(getConfigPath())}`,
				];
				if (state?.expiration_time) {
					lines.push(
						`${theme.info("Token expires:")} ${new Date(
							state.expiration_time
						).toLocaleString()}`
					);
				}
				lines.push(
					`Run ${theme.code("cf auth login --force")} to re-authenticate, or ${theme.code("cf auth logout")} to log out.`
				);
				log.info(lines.join("\n"));
				return;
			}

			// Token refresh failed — proceed with a fresh login.
			log.warn(
				"Existing tokens are invalid or expired. Starting fresh login..."
			);
		} else if (argv.force && isOAuthLoggedIn()) {
			log.info("Re-authenticating...");
		}

		// The OAuth flow refuses to start while env credentials are present,
		// so say so once instead of starting it.
		if (getAuthFromEnv({ allowGlobalAuthKey: false }) !== undefined) {
			log.warn(
				`${theme.code("CLOUDFLARE_API_TOKEN")} is set and takes precedence. Unset it to log in via OAuth.`
			);
			return;
		}

		log.info("Starting OAuth login flow...");

		const ok = await login({
			browser: argv.browser,
			device: argv.device,
			scopes: argv.scopes,
			profile: "default",
		});
		if (!ok) {
			return;
		}

		const state = readAuthCredentials();
		const lines = [
			`${theme.info("Config file:")} ${theme.muted(getConfigPath())}`,
		];
		if (state?.scopes) {
			lines.push(
				state.scopes.length > MAX_INLINE_SCOPES
					? `${theme.info("Scopes:")} ${state.scopes.length} selected. Run ${theme.code("cf auth whoami")} to see the full list.`
					: `${theme.info("Scopes:")} ${state.scopes.join(", ")}`
			);
		}
		if (state?.expiration_time) {
			lines.push(
				`${theme.info("Token expires:")} ${new Date(
					state.expiration_time
				).toLocaleString()}`
			);
		}
		log.info(lines.join("\n"));
	},
};

export default loginCommand;
