/**
 * create command
 * @generated from apis/overlays/connector-interrupts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"reboot-purge": {
			kind: "boolean",
			brief: "Purge connector state.",
			optional: true,
		},
		"restart-purge": {
			kind: "boolean",
			brief: "Purge connector state.",
			optional: true,
		},
		"shutdown-purge": {
			kind: "boolean",
			brief: "Purge connector state.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Interrupt action for a connector.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "connector-id", brief: "Connector ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <connector-id>",
	describe: "Create Interrupt",
	usage:
		"$0 connector-interrupts create <connector-id>\n\nCreates an interrupt for a Magic WAN Connector.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
