/**
 * list command
 * @generated from apis/overlays/content-scan.ts
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
	describe: "List the Content Scanning custom expressions of a zone.",
	usage:
		"$0 content-scan expressions list\n\nList the Content Scanning custom expressions configured for the zone, each with its own identifier. A custom expression tells the scanner how to reach content objects in a request it cannot parse on its own, such as files Base64-encoded inside a JSON body.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
