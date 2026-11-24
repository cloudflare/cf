/**
 * delete command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
			placeholder: "pattern-id",
			brief: "URL ignore pattern identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <pattern-id>",
	describe: "Delete a URL ignore pattern",
	usage:
		"$0 email-security url-ignore-patterns delete <pattern-id>\n\nRemoves a URL rewrite ignore pattern. After deletion, URLs matching this pattern will be rewritten again.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
