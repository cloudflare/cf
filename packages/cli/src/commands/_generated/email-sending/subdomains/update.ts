/**
 * update command
 * @generated from apis/overlays/email-sending.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"drop-suppressed-recipients": {
			kind: "boolean",
			brief:
				"Whether a send request that includes a recipient suppressed on\nthis subdomain drops that recipient and still delivers to the\nrest, instead of failing the entire request.\n",
			optional: true,
		},
		"preview-enabled": {
			kind: "boolean",
			brief:
				"Whether sent messages from this subdomain can be previewed in the activity log.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"At least one of `preview_enabled` or `drop_suppressed_recipients` must be provided. A field omitted from the request body is left unchanged. ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "subdomain-id",
			brief: "Sending subdomain identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <subdomain-id>",
	describe: "Update a sending subdomain",
	usage:
		"$0 email-sending subdomains update <subdomain-id>\n\nUpdates the activity-log preview preference for a sending subdomain.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
