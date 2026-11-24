import $create from "./create.js";
import $deleterotatedsecret from "./delete-rotated-secret.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $rotatesecret from "./rotate-secret.js";
import $update from "./update.js";
/**
 * oauth-clients command group
 * @generated from apis/overlays/iam.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "oauth-clients",
	describe: "Operations for oauth-clients",

	routes: {
		create: $create,
		delete: $delete,
		"delete-rotated-secret": $deleterotatedsecret,
		get: $get,
		list: $list,
		"rotate-secret": $rotatesecret,
		update: $update,
	},
});

export default command;
