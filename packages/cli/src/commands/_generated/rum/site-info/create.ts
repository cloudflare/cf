/**
 * create command
 * @generated from apis/overlays/rum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"auto-install": {
			kind: "boolean",
			brief:
				"If enabled, the JavaScript snippet is automatically injected for orange-clouded sites.",
			optional: true,
		},
		host: {
			kind: "parsed",
			brief: "The hostname to use for gray-clouded sites.",
			optional: true,
			parse: String,
		},
		"zone-tag": {
			kind: "parsed",
			brief: "The zone identifier.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a Web Analytics site",
	usage: "$0 rum site-info create\n\nCreates a new Web Analytics site.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
