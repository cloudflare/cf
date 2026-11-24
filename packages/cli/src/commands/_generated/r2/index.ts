import $buckets from "./buckets/index.js";
import $objects from "./objects/index.js";
import $superslurper from "./super-slurper/index.js";
import $temporarycredentials from "./temporary-credentials/index.js";
/**
 * r2 command
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "r2",
	describe:
		"S3-compatible object storage with zero egress fees — buckets, lifecycle rules, event notifications, and data migration",

	routes: {
		buckets: $buckets,
		objects: $objects,
		"super-slurper": $superslurper,
		"temporary-credentials": $temporarycredentials,
	},
});

export default command;
