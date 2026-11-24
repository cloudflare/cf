/**
 * edit command
 * @generated from apis/overlays/argo.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		value: {
			kind: "parsed",
			brief: "Specifies the enablement value of Argo Smart Routing.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "value", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Configures the enablement of Argo Smart Routing.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Patch Argo Smart Routing setting",
	usage:
		"$0 argo smart-routing edit\n\nConfigures the value of the Argo Smart Routing enablement setting.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
