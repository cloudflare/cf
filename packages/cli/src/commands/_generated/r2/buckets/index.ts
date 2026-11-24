import $cors from "./cors/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $domains from "./domains/index.js";
import $edit from "./edit.js";
import $eventnotifications from "./event-notifications/index.js";
import $get from "./get.js";
import $jobs from "./jobs/index.js";
import $lifecycle from "./lifecycle/index.js";
import $list from "./list.js";
import $localuploads from "./local-uploads/index.js";
import $locks from "./locks/index.js";
import $metrics from "./metrics/index.js";
import $sippy from "./sippy/index.js";
/**
 * buckets command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "buckets",
	describe:
		"Create and configure R2 buckets including CORS, lifecycle, custom domains, event notifications, and object locks",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		cors: $cors,
		domains: $domains,
		"event-notifications": $eventnotifications,
		jobs: $jobs,
		lifecycle: $lifecycle,
		"local-uploads": $localuploads,
		locks: $locks,
		metrics: $metrics,
		sippy: $sippy,
	},
});

export default command;
