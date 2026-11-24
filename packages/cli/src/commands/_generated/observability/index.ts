import $usagelimit from "./usage-limit/index.js";
import $tail from "#commands/observability/tail/index.js";
/**
 * observability command
 * @generated from apis/overlays/observability.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "observability",
	describe: "observability",

	routes: {
		tail: withHandWrittenDryRun($tail, "native"),
		"usage-limit": $usagelimit,
	},
});

export default command;
