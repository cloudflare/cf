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
		"include-resources": {
			kind: "boolean",
			brief: "Include resources in the response.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "recipient-id",
			brief: "Share Recipient identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <recipient-id>",
	describe: "Get share recipient by ID",
	usage:
		"$0 resource-sharing recipients get <recipient-id>\n\nGet share recipient by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
