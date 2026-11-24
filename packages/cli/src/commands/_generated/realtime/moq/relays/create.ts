/**
 * create command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "Human-readable name for the relay.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a relay",
	usage:
		"$0 realtime moq relays create\n\nProvisions a new MoQ relay instance. Auto-creates a publish+subscribe token and a subscribe-only token. Token values are included in the response (shown once). Config is always set to defaults (upstreams off) and cannot be supplied here — sending a non-empty `config` is rejected (21014); `null` or `{}` is accepted as absent. Use PUT to configure the relay after it exists.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
