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
		"target-environment": {
			kind: "parsed",
			brief:
				"The target environment for the client version (e.g., windows, macos).",
			parse: String,
		},
		"release-track": {
			kind: "enum",
			brief:
				"The release track (ga for General Availability, beta for Beta releases).",
			values: ["ga", "beta"],
		},
		page: {
			kind: "parsed",
			brief: "The page number to return.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The maximum number of versions to return per page.",
			optional: true,
			parse: Number,
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
	describe: "List client versions",
	usage:
		"$0 zero-trust devices client-versions list\n\nLists available WARP client versions for a specific target environment and release track. This endpoint is in Beta.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
