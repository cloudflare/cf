import $archive from "./archive.js";
import $export from "./export.js";
import $get from "./get.js";
import $list from "./list.js";
import $unarchive from "./unarchive.js";
/**
 * instances command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "instances",
	describe: "Operations for casb.findings.instances",

	routes: {
		archive: $archive,
		export: $export,
		get: $get,
		list: $list,
		unarchive: $unarchive,
	},
});

export default command;
