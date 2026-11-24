/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
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
	describe: "List countries",
	usage:
		"$0 cloudforce-one threat-intel events countries list\n\nLists the countries used in threat intelligence data, such as attacker and target countries.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
