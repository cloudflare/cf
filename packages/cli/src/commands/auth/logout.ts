import { getActiveProfile, logout } from "../../lib/oauth/index.js";
import { theme } from "../../lib/ui/index.js";
import { log } from "../../lib/ui/log.js";
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
				`This directory has profile "${activeProfile}" active. ${theme.code("cf auth logout")} removes the default profile's token, not "${activeProfile}". To delete "${activeProfile}", run:`,
				`cf auth delete ${activeProfile}`
			);
		}

		await logout("default");
	},
};

export default logoutCommand;
