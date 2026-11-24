/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "get <feed-id>",
	describe: "Get Threat Signals feed skills",
	usage:
		"$0 cloudforce-one threat-signals feeds skills get <feed-id>\n\nRetrieves active non-IOC-context Managed Default Skills followed by active Custom Skills assigned to the feed, with each entry's source. Free Threat Signals accounts receive only those Managed Default Skills.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
