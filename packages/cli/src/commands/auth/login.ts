import {
	getActiveProfile,
	getConfigPath,
	getValidToken,
	isOAuthLoggedIn,
	login,
	readAuthCredentials,
	setProfile,
} from "../../lib/oauth/index.js";
import { hint, info, theme, warning } from "../../lib/ui/index.js";
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
			console.log(
				warning(
					`This directory has profile "${activeProfile}" active. \`cf auth login\` updates the default profile, not "${activeProfile}".\n` +
						`To re-authenticate "${activeProfile}", run \`cf auth create ${activeProfile}\`.`
				)
			);
		}

		setProfile("default");

		if (!argv.force && isOAuthLoggedIn()) {
			// Verify the stored tokens actually work, refreshing if needed.
			const validToken = await getValidToken();
			if (validToken) {
				const state = readAuthCredentials();
				console.log(info("You are already logged in."));
				console.log(
					`${theme.info("Config file:")} ${theme.muted(getConfigPath())}`
				);
				if (state?.expiration_time) {
					console.log(
						`${theme.info("Token expires:")} ${new Date(
							state.expiration_time
						).toLocaleString()}`
					);
				}
				console.log(
					hint(
						`Run ${theme.code("cf auth login --force")} to re-authenticate, or ${theme.code("cf auth logout")} to log out.`
					)
				);
				return;
			}

			// Token refresh failed — proceed with a fresh login.
			console.log(
				warning(
					"Existing tokens are invalid or expired. Starting fresh login...\n"
				)
			);
		} else if (argv.force && isOAuthLoggedIn()) {
			console.log(info("Re-authenticating...\n"));
		}

		console.log(info("Starting OAuth login flow...\n"));

		const ok = await login({
			browser: argv.browser,
			device: argv.device,
			scopes: argv.scopes,
			profile: "default",
		});
		if (!ok) {
			// Env credentials are present; the OAuth flow refuses to start.
			console.log(
				warning(
					"CLOUDFLARE_API_TOKEN is set and takes precedence. Unset it to log in via OAuth."
				)
			);
			return;
		}

		const state = readAuthCredentials();
		console.log(
			`${theme.info("Config file:")} ${theme.muted(getConfigPath())}`
		);
		if (state?.scopes) {
			if (state.scopes.length > MAX_INLINE_SCOPES) {
				console.log(`${theme.info("Scopes:")} ${state.scopes.length} selected`);
				console.log(
					hint(`Run ${theme.code("cf auth whoami")} to see the full list.`)
				);
			} else {
				console.log(`${theme.info("Scopes:")} ${state.scopes.join(", ")}`);
			}
		}
		if (state?.expiration_time) {
			console.log(
				`${theme.info("Token expires:")} ${new Date(
					state.expiration_time
				).toLocaleString()}`
			);
		}
	},
};

export default loginCommand;
