import { apiCommand } from "../../lib/api-command.js";
import { getActiveProfile, logout } from "../../lib/oauth/index.js";
import { theme } from "../../lib/ui/index.js";
import { log } from "../../lib/ui/log.js";
import { assertNoProfileFlag } from "./profiles.js";

const logoutCommand = apiCommand({
	command: "logout",
	describe: "Log out and remove stored credentials",
	flags: {},
	operands: [],
	profileCompletion: false,
	async handler(argv) {
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
});

export default logoutCommand;
