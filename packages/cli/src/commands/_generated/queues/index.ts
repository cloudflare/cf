import $consumers from "./consumers/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $messages from "./messages/index.js";
import $metrics from "./metrics/index.js";
import $purge from "./purge/index.js";
import $subscriptions from "./subscriptions/index.js";
/**
 * queues command
 * @generated from apis/overlays/queues.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "queues",
	describe:
		"Reliable message queuing between Workers — produce, consume, and batch-process messages at scale",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		consumers: $consumers,
		messages: $messages,
		metrics: $metrics,
		purge: $purge,
		subscriptions: $subscriptions,
	},
});

export default command;
