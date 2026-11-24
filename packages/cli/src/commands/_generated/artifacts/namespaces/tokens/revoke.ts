/**
 * revoke command
 * @generated from apis/overlays/artifacts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Artifacts namespace name.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "id",
			brief: "Token ID. Must match /^[0-9a-z]{16}$/.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "revoke <id>",
	describe: "Revoke a token",
	usage:
		"$0 artifacts namespaces tokens revoke <id>\n\nRevokes an Artifacts repository token. Token IDs are resolved through an eventually consistent index, so revoking a token within about a second of creating it can return 404; retry after a short delay.",
	...parameters,
	loader: () => import("./revoke.handler.js"),
});

export default command;
