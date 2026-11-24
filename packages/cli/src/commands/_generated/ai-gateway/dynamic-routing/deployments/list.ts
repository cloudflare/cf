/**
 * list command
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
		id: { kind: "parsed", brief: "ID", parse: String },
		page: {
			kind: "parsed",
			brief: "Page number",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of deployments per page",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List dynamic route deployments",
	usage:
		"$0 ai-gateway dynamic-routing deployments list\n\nLists the deployment history of a dynamic route.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
