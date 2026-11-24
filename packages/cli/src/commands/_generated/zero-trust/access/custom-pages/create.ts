/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"app-count": {
			kind: "parsed",
			brief: "Number of apps the custom page is assigned to.",
			optional: true,
			parse: Number,
		},
		"contract-version": {
			kind: "parsed",
			brief:
				"Contract version of the page's Liquid template. Present (>= 1) marks a sanitized template; absent or 0 marks a legacy page served verbatim.",
			optional: true,
			parse: Number,
		},
		"created-at": {
			kind: "parsed",
			brief: "The created_at field",
			optional: true,
			parse: String,
		},
		"custom-html": {
			kind: "parsed",
			brief: "Custom page HTML.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Custom page name.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Custom page type.",
			optional: true,
			choices: ["identity_denied", "forbidden", "login", "interstitial"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		uid: { kind: "parsed", brief: "UUID.", optional: true, parse: String },
		"updated-at": {
			kind: "parsed",
			brief: "The updated_at field",
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
	describe: "Create a custom page",
	usage: "$0 zero-trust access custom-pages create\n\nCreate a custom page",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
