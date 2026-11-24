import $applications from "./applications/index.js";
import $images from "./images/index.js";
import $registries from "./registries/index.js";
import $usage from "./usage.js";
import $build from "#commands/containers/build/index.js";
import $push from "#commands/containers/push/index.js";
import $ssh from "#commands/containers/ssh/index.js";
/**
 * containers command
 * @generated from apis/overlays/containers.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "containers",
	describe:
		"Deploy and manage Containers applications on Cloudflare's global network",

	routes: {
		build: withHandWrittenDryRun($build, "preview"),
		push: withHandWrittenDryRun($push, "preview"),
		ssh: withHandWrittenDryRun($ssh, "preview"),
		usage: $usage,
		applications: $applications,
		images: $images,
		registries: $registries,
	},
});

export default command;
