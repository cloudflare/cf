/**
 * get command
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
	},
	operands: [
		{
			placeholder: "dataset-id",
			brief:
				"Name of the dataset. A list of supported datasets can be found on the [Developer Docs](https://developers.cloudflare.com/logs/reference/log-fields/).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <dataset-id>",
	describe: "List fields",
	usage:
		"$0 logpush account-datasets fields get <dataset-id>\n\nLists all fields available for a dataset. The response result is. an object with key-value pairs, where keys are field names, and values are descriptions.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
