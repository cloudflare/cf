import $get from "./get.js";
import $list from "./list.js";
import $proximitywords from "./proximity-words/index.js";
import $worker from "./worker/index.js";
/**
 * validators command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "validators",
	describe: "Data Loss Prevention - list and retrieve content validators",

	routes: {
		get: $get,
		list: $list,
		"proximity-words": $proximitywords,
		worker: $worker,
	},
});

export default command;
