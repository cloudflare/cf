/**
 * move command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"source-namespace": {
			kind: "parsed",
			brief: "Namespace currently containing the instance.",
			default: "default",
			parse: String,
		},
		"destination-namespace": {
			kind: "parsed",
			brief: "Namespace to move the instance into.",
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
	operands: [
		{
			placeholder: "instance-id",
			brief: "AI Search instance ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "move <instance-id>",
	describe: "Move an instance to a different namespace.",
	usage:
		"$0 ai-search move <instance-id>\n\nMoves an instance from its current namespace to the specified target namespace. Use 'default' with --destination-namespace to move the instance back to the default namespace. Fails with 400 if the target namespace already has an instance with the same id (ids must be unique within a namespace — the same id can exist in different namespaces).",
	...parameters,
	loader: () => import("./move.handler.js"),
});

export default command;
