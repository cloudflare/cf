/**
 * update command
 * @generated from apis/overlays/pipelines.ts
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "sink-id",
			brief: "Specifies the publid ID of the sink.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <sink-id>",
	describe: "Update Sink",
	usage:
		"$0 pipelines sinks update <sink-id>\n\nUpdate a Sink's credentials or rolling policy, creating a new version of the Sink. Only `credentials` and `rolling_policy` (R2) or `token` and `rolling_policy` (Basin Catalog, including Sinks created with the legacy `r2_data_catalog` type) can be changed; omitted fields keep their current values. Secrets are never returned in responses. Pipelines that use the Sink keep their current version until they are moved to the latest one with Update Pipeline Tables.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
