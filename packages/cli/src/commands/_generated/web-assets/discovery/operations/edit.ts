/**
 * edit command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		state: {
			kind: "parsed",
			brief:
				"Mark state of operation in API Discovery\n  * `review` - Mark operation as for review\n  * `ignored` - Mark operation as ignored",
			optional: true,
			choices: ["review", "ignored"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "state", "text"),
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
	operands: [
		{
			placeholder: "discovery-id",
			brief: "Discovery ID of a discovered operation",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <discovery-id>",
	describe: "Edit a discovered web or API operation",
	usage:
		"$0 web-assets discovery operations edit <discovery-id>\n\nUpdates the state of a discovered web or API operation.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
