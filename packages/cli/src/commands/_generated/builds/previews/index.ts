import $createbuild from "./create-build.js";
import $get from "./get.js";
import $listbuilds from "./list-builds.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * previews command group
 * @generated from apis/overlays/builds.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "previews",
	describe:
		"Manage the Previews that Workers Builds creates for non-production branches.",

	routes: {
		"create-build": $createbuild,
		get: $get,
		list: $list,
		"list-builds": $listbuilds,
		update: $update,
	},
});

export default command;
