import $history from "./history/index.js";
import $profile from "./profile/index.js";
/**
 * billing command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "billing",
	describe:
		"View billing history and payment profile for your user (deprecated — prefer account-level billing)",

	routes: {
		history: $history,
		profile: $profile,
	},
});

export default command;
