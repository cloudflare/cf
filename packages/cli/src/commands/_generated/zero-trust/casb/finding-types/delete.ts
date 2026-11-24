/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "finding-type-id",
			brief: "A UUID string identifying the finding type.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <finding-type-id>",
	describe: "Delete a custom finding type",
	usage:
		"$0 zero-trust casb finding-types delete <finding-type-id>\n\nDelete an existing custom finding type. **Security**: Only custom finding types (not system-managed) can be deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
