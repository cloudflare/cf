/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <share-resource-id>",
	describe: "Trigger a resource deletion from a share",
	usage:
		"$0 resource-sharing resources delete <share-resource-id>\n\nDeletion is not immediate, an updated share resource object with a new status will be returned.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
