/**
 * delete command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"hold-after": {
			kind: "parsed",
			brief:
				"If `hold_after` is provided, the hold will be temporarily disabled,\nthen automatically re-enabled by the system at the time specified\nin this RFC3339-formatted timestamp. Otherwise, the hold will be\ndisabled indefinitely. `hold_after` cannot be provided for CDN-only zones.",
			optional: true,
			parse: String,
		},
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete",
	describe: "Remove Zone Hold",
	usage:
		"$0 zones holds delete\n\nStop enforcement of a zone hold on the zone, permanently or temporarily, allowing the creation and activation of zones with this zone's hostname. Existing zone holds can be removed from CDN-only zones when `hold_after` is not provided. Active holds are automatically disabled when a zone transitions to CDN-only mode.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
