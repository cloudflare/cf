/**
 * poll command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"feed-id": {
			kind: "parsed",
			brief:
				'UUID of a specific feed to poll, or "all" to poll all feeds. Omit or pass "all" for all feeds.',
			optional: true,
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
	command: "poll",
	describe: "Trigger Threat Signals feed poll",
	usage:
		"$0 cloudforce-one threat-signals feeds poll\n\nStarts an immediate poll of one or all Threat Signals feeds.",
	...parameters,
	loader: () => import("./poll.handler.js"),
});

export default command;
