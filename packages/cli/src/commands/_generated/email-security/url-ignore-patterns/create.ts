/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		comments: {
			kind: "parsed",
			brief: "Optional note describing the reason for the ignore pattern.",
			optional: true,
			parse: String,
		},
		pattern: {
			kind: "parsed",
			brief: "Regular expression identifying URLs to exempt from rewriting.",
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
			brief:
				"Creates a URL ignore pattern that exempts matching URLs from rewriting.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a URL ignore pattern",
	usage:
		"$0 email-security url-ignore-patterns create\n\nCreates a new URL rewrite ignore pattern. URLs matching this pattern will not be rewritten.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
