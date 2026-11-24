/**
 * update command
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
			optional: true,
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
	operands: [
		{ placeholder: "redundancy-group-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <redundancy-group-id>",
	describe: "Update a Redundancy Group",
	usage:
		"$0 magic-transit redundancy-groups update <redundancy-group-id>\n\nReplaces the name, description, and full set of members for an existing redundancy group.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
