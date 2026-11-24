/**
 * list command
 * @generated from apis/overlays/k2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"stream-id": {
			kind: "parsed",
			brief: "Specifies the public ID of the K2 stream.",
			parse: String,
		},
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
	describe: "List subscriptions with consumer lag",
	usage:
		"$0 k2 streams subscriptions list\n\nLists every subscription on one stream, oldest first. Lag uses committed positions, not reserved read positions. A failed tail observation preserves subscription metadata and returns unavailable lag.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
