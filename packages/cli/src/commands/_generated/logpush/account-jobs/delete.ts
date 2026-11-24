/**
 * delete command
 * @generated from apis/overlays/logpush.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{ placeholder: "job-id", brief: "Unique id of the job.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <job-id>",
	describe: "Delete Logpush job",
	usage:
		"$0 logpush account-jobs delete <job-id>\n\nDeletes a Logpush job.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
