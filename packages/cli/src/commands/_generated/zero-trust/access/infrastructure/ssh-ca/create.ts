/**
 * create command
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
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Add a new SSH Certificate Authority (CA)",
	usage:
		"$0 zero-trust access infrastructure ssh-ca create\n\nAdds a new SSH Certificate Authority (CA).",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
