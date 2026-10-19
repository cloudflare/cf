import { getAuthFromEnv } from "@cloudflare/workers-auth";
import {
	getActiveProfile,
	getConfigPath,
	isOAuthLoggedIn,
	logout,
	setProfile,
} from "../../lib/oauth/index.js";
import { printSuccess } from "../../lib/output.js";
import { theme } from "../../lib/ui/index.js";
import { log, printCommands } from "../../lib/ui/log.js";
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
			log.warn(
				`This directory has profile "${activeProfile}" active. ${theme.code("cf auth logout")} removes the default profile's token, not "${activeProfile}". To delete "${activeProfile}", run:`
			);
			printCommands(`cf auth delete ${activeProfile}`);
		}

		setProfile("default");

		const hasOAuthTokens = isOAuthLoggedIn();
		const hasEnvToken =
			getAuthFromEnv({ allowGlobalAuthKey: false }) !== undefined;

		if (!hasOAuthTokens) {
			if (hasEnvToken) {
				log.info(
					`No cf OAuth credentials found, but ${theme.code("CLOUDFLARE_API_TOKEN")} is set. Unset it to log out.`
				);
			} else {
				log.info("You are not currently logged in. To authenticate, run:");
				printCommands("cf auth login");
			}
			return;
		}

		await logout("default");

		// workers-auth keeps the stored tokens, and says why, while env
		// credentials are set.
		if (hasEnvToken) {
			return;
		}

		printSuccess(`Removed OAuth tokens from ${theme.muted(getConfigPath())}`);
	},
};

export default logoutCommand;
