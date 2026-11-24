/**
 * create command
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
		body: {
			kind: "parsed",
			brief: "Array of Content Scanning custom expressions to create.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Content Scanning custom expressions for a zone.",
	usage:
		'$0 content-scan expressions create\n\nCreate one or more Content Scanning custom expressions, appending them to the existing list of the zone, and return the updated list. Each expression reaches content objects the scanner cannot find automatically, for example `lookup_json_string(http.request.body.raw, "file")`.',
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
