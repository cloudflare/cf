import $list from "./list.js";
/**
 * organizations command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "organizations",
	describe: "View organizations associated with a Cloudflare account",

	routes: {
		list: $list,
	},
});

export default command;
