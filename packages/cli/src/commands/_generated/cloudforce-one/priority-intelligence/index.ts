import $constants from "./constants/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $filters from "./filters/index.js";
import $get from "./get.js";
import $interests from "./interests/index.js";
import $list from "./list.js";
import $matches from "./matches/index.js";
import $profile from "./profile/index.js";
import $quota from "./quota/index.js";
import $resolve from "./resolve.js";
import $topics from "./topics/index.js";
import $update from "./update.js";
/**
 * priority-intelligence command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "priority-intelligence",
	describe: "Operations for priority-intelligence",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		resolve: $resolve,
		update: $update,
		constants: $constants,
		filters: $filters,
		interests: $interests,
		matches: $matches,
		profile: $profile,
		quota: $quota,
		topics: $topics,
	},
});

export default command;
