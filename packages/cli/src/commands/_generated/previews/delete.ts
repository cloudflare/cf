/**
 * delete command
 * @generated from apis/overlays/previews.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Identifier for the Worker, which can be ID or name.",
			parse: String,
		},
		"delete-with-references": {
			kind: "boolean",
			brief:
				"If true, delete the Preview even when other Workers still reference it. Service bindings in those Workers may be left broken. Durable Object namespaces implemented by the deleted Preview are deleted even if other Workers reference them.",
			optional: true,
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
			placeholder: "name",
			brief:
				"Identifier for the Preview, which can be ID, slug, or URL-encoded name.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <name>",
	describe: "Delete Preview",
	usage: "$0 previews delete <name>\n\nDelete a Preview.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
