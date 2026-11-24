/**
 * get command
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "version-id", brief: "Version ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <version-id>",
	describe: "Get a dynamic route version",
	usage:
		"$0 ai-gateway dynamic-routing versions get <version-id>\n\nRetrieves a saved version of a dynamic route, including its routing elements.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
