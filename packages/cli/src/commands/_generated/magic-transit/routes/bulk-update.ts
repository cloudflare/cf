/**
 * bulk-update command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		routes: {
			kind: "parsed",
			brief:
				'The routes field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"nexthop": string, "prefix": string, "priority": number, "description"?: string, "scope"?: {...}, ...more}]. ? marks optional keys.',
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
	command: "bulk-update",
	describe: "Update Many Routes",
	usage:
		"$0 magic-transit routes bulk-update\n\nUpdate multiple Magic static routes. Use `?validate_only=true` as an optional query parameter to run validation only without persisting changes. Only fields for a route that need to be changed need be provided.",
	...parameters,
	loader: () => import("./bulk-update.handler.js"),
});

export default command;
