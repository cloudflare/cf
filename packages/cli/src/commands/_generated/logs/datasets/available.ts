/**
 * available command
 * @generated from apis/overlays/logs.ts
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
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "available",
	describe: "List available account or zone datasets",
	usage:
		"$0 logs datasets available\n\nReturns all dataset types that this account or zone can create. Each entry includes the dataset schema and timestamp field. The schema shows all possible fields for a dataset. However, not all fields may be available for your account or zone. When creating or updating a dataset, only fields available to your account or zone can be enabled. If you request a field that is not available, you will receive an error.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./available.handler.js"),
});

export default command;
