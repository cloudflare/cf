import {
	getActiveProfile,
	getConfigPath,
	isOAuthLoggedIn,
	logout,
	setProfile,
} from "../../lib/auth.js";
import { hint, info, theme, warning } from "../../lib/ui/index.js";
import { assertNoProfileFlag } from "./profiles.js";
import type { CommonYargsOptions } from "../../lib/cli-types.js";
import type { CommandModule } from "yargs";

const logoutCommand: CommandModule<object, CommonYargsOptions> = {
	command: "logout",
	describe: "Log out and remove stored credentials",

	handler: async (argv): Promise<void> => {
		assertNoProfileFlag(
			argv,
			"logout",
			"Run `cf auth delete <name>` to remove a named profile."
		);

		const activeProfile = getActiveProfile();

		if (activeProfile !== "default") {
			console.log(
				warning(
					`This directory has profile "${activeProfile}" active. \`cf auth logout\` removes the default profile's token, not "${activeProfile}".\n` +
						`To delete "${activeProfile}", run \`cf auth delete ${activeProfile}\`.`
				)
			);
		}

		setProfile("default");

		const hasOAuthTokens = isOAuthLoggedIn();
		const hasEnvToken = !!process.env.CLOUDFLARE_API_TOKEN;

		if (!hasOAuthTokens) {
			if (hasEnvToken) {
				console.log(
					info(
						"No cf OAuth credentials found, but CLOUDFLARE_API_TOKEN environment variable is set."
					)
				);
				console.log(info("Unset it with: unset CLOUDFLARE_API_TOKEN"));
			} else {
				console.log(info("You are not currently logged in."));
				console.log(
					hint(`Run ${theme.code("cf auth login")} to authenticate.`)
				);
			}
			return;
		}

		console.log(info("Logging out..."));

		await logout("default");

		console.log(
			`${theme.info("Removed:")} OAuth tokens from ${theme.muted(getConfigPath())}`
		);

		if (hasEnvToken) {
			console.log("");
			console.log(
				warning("CLOUDFLARE_API_TOKEN environment variable is still set.")
			);
			console.log(
				info(
					"You will remain authenticated via the env var. Unset it with: unset CLOUDFLARE_API_TOKEN"
				)
			);
		}
	},
};

export default logoutCommand;
