import $create from "./create.js";
import $data from "./data.js";
import $downloads from "./downloads/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $permissions from "./permissions/index.js";
import $providers from "./providers/index.js";
import $snapshots from "./snapshots/index.js";
import $update from "./update.js";
import $uploads from "./uploads/index.js";
/**
 * indicator-feeds command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "indicator-feeds",
	describe:
		"Threat indicator feeds — subscribe to and manage curated lists of malicious IPs, domains, and URLs",

	routes: {
		create: $create,
		data: $data,
		get: $get,
		list: $list,
		update: $update,
		downloads: $downloads,
		permissions: $permissions,
		providers: $providers,
		snapshots: $snapshots,
		uploads: $uploads,
	},
});

export default command;
