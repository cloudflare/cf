import $prepare from "./prepare.js";
import $delete from "#commands/containers/images/delete/index.js";
import $list from "#commands/containers/images/list/index.js";
/**
 * images command group
 * @generated from apis/overlays/containers.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "images",
	describe: "Operations for images",

	routes: {
		delete: withHandWrittenDryRun($delete, "preview"),
		list: withHandWrittenDryRun($list, "preview"),
		prepare: $prepare,
	},
});

export default command;
