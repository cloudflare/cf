/**
 * create command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"build-token-name": {
			kind: "parsed",
			brief: "The build_token_name field",
			optional: true,
			parse: String,
		},
		"build-token-secret": {
			kind: "parsed",
			brief: "The build_token_secret field",
			optional: true,
			parse: String,
		},
		"cloudflare-token-id": {
			kind: "parsed",
			brief: "The cloudflare_token_id field",
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
	describe: "Create build token",
	usage: "$0 builds tokens create\n\nCreate a new build authentication token",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
