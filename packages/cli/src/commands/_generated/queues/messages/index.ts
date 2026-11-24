import $ack from "./ack.js";
import $bulkpush from "./bulk-push.js";
import $extendleases from "./extend-leases.js";
import $peek from "./peek.js";
import $pull from "./pull.js";
import $purge from "./purge.js";
import $push from "./push.js";
/**
 * messages command group
 * @generated from apis/overlays/queues.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "messages",
	describe:
		"Push messages to a queue and pull or acknowledge them from consumers",

	routes: {
		ack: $ack,
		"bulk-push": $bulkpush,
		"extend-leases": $extendleases,
		peek: $peek,
		pull: $pull,
		purge: $purge,
		push: $push,
	},
});

export default command;
