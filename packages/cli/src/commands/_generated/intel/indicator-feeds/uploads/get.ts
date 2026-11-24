/**
 * get command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"feed-id": { kind: "parsed", brief: "Indicator feed ID", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "upload-id", brief: "Upload ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <upload-id>",
	describe: "Get indicator feed upload status",
	usage:
		"$0 intel indicator-feeds uploads get <upload-id>\n\nPolls an asynchronously accepted upload. Continue polling after the recommended `poll_after_seconds` delay until status is `Unified` or `Error`. `Unified` is returned only after the durable loader finishes.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
