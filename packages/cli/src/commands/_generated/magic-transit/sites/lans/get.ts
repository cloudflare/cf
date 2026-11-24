/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"site-id": { kind: "parsed", brief: "Identifier", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "lan-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <lan-id>",
	describe: "Site LAN Details",
	usage: "$0 magic-transit sites lans get <lan-id>\n\nGet a specific Site LAN.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
