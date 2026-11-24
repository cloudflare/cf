/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "get",
	describe: "Get default datasets",
	usage:
		"$0 cloudforce-one threat-intel datasets preferences get\n\nReturns your default datasets, the account's default datasets, and the datasets that event searches currently use when `datasetId` is omitted. `unresolvableDatasetIds` lists saved datasets you can no longer read.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
