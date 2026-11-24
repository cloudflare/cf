import $list from "./list.js";
/**
 * subscriptions command group
 * @generated from apis/overlays/k2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "subscriptions",
	describe:
		"Subscriptions that consume a K2 stream, with committed-position lag",

	routes: {
		list: $list,
	},
});

export default command;
