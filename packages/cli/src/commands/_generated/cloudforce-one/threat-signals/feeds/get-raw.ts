/**
 * get-raw command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		format: {
			kind: "enum",
			brief:
				"Response format. Use xml for application/xml; omit it for the default text/plain response.",
			values: ["xml"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "feed-id",
			brief: "UUID of the Threat Signals feed",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-raw <feed-id>",
	describe: "Get Threat Signals feed XML",
	usage:
		"$0 cloudforce-one threat-signals feeds get-raw <feed-id>\n\nRetrieves the feed document fetched by the most recent poll as text/plain by default or application/xml when format is xml.",
	...parameters,
	loader: () => import("./get-raw.handler.js"),
});

export default command;
