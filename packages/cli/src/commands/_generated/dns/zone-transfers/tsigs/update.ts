/**
 * update command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		algo: {
			kind: "parsed",
			brief: "TSIG algorithm.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "TSIG key name.",
			optional: true,
			parse: String,
		},
		secret: {
			kind: "parsed",
			brief: "TSIG secret.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "tsig-id", brief: "Tsig ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <tsig-id>",
	describe: "Update TSIG",
	usage: "$0 dns zone-transfers tsigs update <tsig-id>\n\nModify TSIG.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
