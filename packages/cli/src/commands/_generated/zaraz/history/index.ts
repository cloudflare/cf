import $configs from "./configs/index.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * history command group
 * @generated from apis/overlays/zaraz.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "history",
	describe:
		"Configuration version history — browse and restore previous Zaraz configurations",

	routes: {
		list: $list,
		update: $update,
		configs: $configs,
	},
});

export default command;
