/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"gateway-id": { kind: "parsed", brief: "Gateway ID", parse: String },
		"version-id": {
			kind: "parsed",
			brief: "The version_id field",
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
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <id>",
	describe: "Deploy a dynamic route version",
	usage:
		"$0 ai-gateway dynamic-routing deployments create <id>\n\nDeploys the specified version of a dynamic route so that it serves traffic. Deploy an earlier version to roll back.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
