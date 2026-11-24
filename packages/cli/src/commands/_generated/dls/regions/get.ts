/**
 * get command
 * @generated from apis/overlays/dls.ts
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
	operands: [
		{
			placeholder: "region-id",
			brief:
				"UUID of the region (custom or managed) or region_key of a managed region.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <region-id>",
	describe: "Get a DLS region",
	usage:
		"$0 dls regions get <region-id>\n\nRetrieve a single DLS region (managed or custom) by ID or region key.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
