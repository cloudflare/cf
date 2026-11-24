import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $remediationtypes from "./remediation-types/index.js";
import $update from "./update.js";
import $validate from "./validate.js";
/**
 * finding-types command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "finding-types",
	describe: "Operations for casb.finding-types",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		validate: $validate,
		"remediation-types": $remediationtypes,
	},
});

export default command;
