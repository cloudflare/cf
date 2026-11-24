import $accountassets from "./account-assets/index.js";
import $accountcustompages from "./account-custom-pages/index.js";
/**
 * custom-pages command
 * @generated from apis/overlays/custom-pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "custom-pages",
	describe:
		"Manage custom error and challenge pages and their assets for accounts and zones",

	routes: {
		"account-assets": $accountassets,
		"account-custom-pages": $accountcustompages,
	},
});

export default command;
