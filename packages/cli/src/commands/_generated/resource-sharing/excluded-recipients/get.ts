/**
 * get command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"share-id": {
			kind: "parsed",
			brief: "Share identifier tag.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "excluded-recipient-id",
			brief: "Share Excluded Recipient identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <excluded-recipient-id>",
	describe: "Get share excluded recipient by ID",
	usage:
		"$0 resource-sharing excluded-recipients get <excluded-recipient-id>\n\nGets a single excluded recipient of a share by its identifier tag.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
