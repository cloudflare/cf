/**
 * tune-severity command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"new-severity": {
			kind: "parsed",
			brief: "The numeric severity value to apply to the finding.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for updating a finding's severity.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "finding-id",
			brief:
				"The \`id\` of a finding, as returned in each item of the List posture findings response. It is a base64-encoded identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "tune-severity <finding-id>",
	describe: "Update the severity for a finding",
	usage:
		"$0 zero-trust casb findings tune-severity <finding-id>\n\nUpdate the severity of a Finding. This will update the `severity_override` field on the Finding payload with the new severity value.",
	...parameters,
	loader: () => import("./tune-severity.handler.js"),
});

export default command;
