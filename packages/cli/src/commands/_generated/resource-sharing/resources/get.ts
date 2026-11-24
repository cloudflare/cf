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
			placeholder: "share-resource-id",
			brief: "Share Resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <share-resource-id>",
	describe: "Get share resource by ID",
	usage:
		"$0 resource-sharing resources get <share-resource-id>\n\nGet share resource by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
