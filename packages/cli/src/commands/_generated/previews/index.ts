import $delete from "./delete.js";
import $deploy from "#commands/previews/deploy/index.js";
/**
 * previews command
 * @generated from apis/overlays/previews.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "previews",
	describe: "Manage Worker Previews",

	routes: {
		delete: $delete,
		deploy: withHandWrittenDryRun($deploy, "preview"),
	},
});

export default command;
