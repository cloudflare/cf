/**
 * list command
 * @generated from apis/overlays/cloud-connector.ts
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
	command: "list",
	describe: "Rules",
	usage:
		"$0 cloud-connector rules list\n\nRetrieves the Cloud Connector rules configured for a zone. Rules define how traffic is routed to cloud services.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
