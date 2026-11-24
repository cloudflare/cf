import $concurrency from "./concurrency/index.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $instances from "./instances/index.js";
import $list from "./list.js";
import $settings from "./settings/index.js";
import $versions from "./versions/index.js";
/**
 * workflows command
 * @generated from apis/overlays/workflows.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "workflows",
	describe:
		"Durable, multi-step workflows that run on Workers with automatic retries and state persistence",

	routes: {
		delete: $delete,
		get: $get,
		list: $list,
		concurrency: $concurrency,
		instances: $instances,
		settings: $settings,
		versions: $versions,
	},
});

export default command;
