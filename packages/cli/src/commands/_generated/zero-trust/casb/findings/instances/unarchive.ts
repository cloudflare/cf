/**
 * unarchive command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"check-instances": {
			kind: "parsed",
			brief: "A list of finding instance IDs to pass along.",
			variadic: true,
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
			brief: "Request body for bulk actions on finding instances.",
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
	command: "unarchive <finding-id>",
	describe: "Remove the archive marking from a finding instance",
	usage:
		"$0 zero-trust casb findings instances unarchive <finding-id>\n\nRemove the archive marking from one or more finding instances.",
	...parameters,
	loader: () => import("./unarchive.handler.js"),
});

export default command;
