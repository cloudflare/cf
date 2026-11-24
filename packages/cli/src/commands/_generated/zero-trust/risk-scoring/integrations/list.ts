/**
 * list command
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
	command: "list",
	describe: "List all risk score integrations for the account.",
	usage:
		"$0 zero-trust risk-scoring integrations list\n\nLists all configured Zero Trust risk score integrations for the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
