/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"project-type": { kind: "parsed", brief: "Project type", parse: String },
		"request-type": {
			kind: "parsed",
			brief:
				"Filter fields to those applicable to this request type. Fields without request type restrictions are always included.",
			optional: true,
			parse: String,
		},
		country: {
			kind: "parsed",
			brief: "Exclude fields restricted for this alpha-2 country code",
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
	command: "list",
	describe: "List metadata fields for an RFI type",
	usage:
		"$0 cloudforce-one requests metadata list\n\nGet custom metadata fields available for the specified project type",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
