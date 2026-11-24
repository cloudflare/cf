/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "Optional description",
			default: "",
			parse: String,
		},
		members: {
			kind: "parsed",
			brief:
				'Tunnels to add to the group. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string, "type": "gre" | "ipsec" | "cni"}].',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable name for the redundancy group",
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
	describe: "Create a Redundancy Group",
	usage:
		"$0 magic-transit redundancy-groups create\n\nCreates a new redundancy group, optionally with tunnel members.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
