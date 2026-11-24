/**
 * get command
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
		name: { kind: "parsed", brief: "Repository name.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "hash",
			brief: "40-character lowercase hexadecimal Git object hash.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <hash>",
	describe: "Read a Git tree",
	usage:
		"$0 artifacts namespaces repos trees get <hash>\n\nReturns decoded entries for an immutable Git tree object. A commit hash returns that commit's root tree; a blob or tag hash returns 422. Tree responses are cacheable forever by hash.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
