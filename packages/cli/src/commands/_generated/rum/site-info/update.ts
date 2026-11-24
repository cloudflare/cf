/**
 * update command
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
		enabled: {
			kind: "boolean",
			brief:
				"Enables or disables RUM. This option can be used only when auto_install is set to true.",
			optional: true,
		},
		host: {
			kind: "parsed",
			brief: "The hostname to use for gray-clouded sites.",
			optional: true,
			parse: String,
		},
		lite: {
			kind: "boolean",
			brief:
				"If enabled, the JavaScript snippet will not be injected for visitors from the EU.",
			optional: true,
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
	operands: [{ placeholder: "site-id", brief: "Identifier.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <site-id>",
	describe: "Update a Web Analytics site",
	usage:
		"$0 rum site-info update <site-id>\n\nUpdates an existing Web Analytics site.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
