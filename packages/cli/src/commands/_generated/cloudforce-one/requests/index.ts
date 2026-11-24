import $assets from "./assets/index.js";
import $constants from "./constants/index.js";
import $create from "./create.js";
import $get from "./get.js";
import $legalresponse from "./legal-response/index.js";
import $list from "./list.js";
import $messages from "./messages/index.js";
import $metadata from "./metadata/index.js";
import $quota from "./quota/index.js";
import $types from "./types/index.js";
import $update from "./update.js";
import $user from "./user/index.js";
/**
 * requests command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "requests",
	describe:
		"Additional request operations — priority listing and asset creation",

	routes: {
		create: $create,
		get: $get,
		list: $list,
		update: $update,
		assets: $assets,
		constants: $constants,
		"legal-response": $legalresponse,
		messages: $messages,
		metadata: $metadata,
		quota: $quota,
		types: $types,
		user: $user,
	},
});

export default command;
