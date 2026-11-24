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
			placeholder: "config-id",
			brief: "Defines the Config ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <config-id>",
	describe: "Get the Latest Scan Result",
	usage:
		"$0 cloudforce-one scans results get <config-id>\n\nRetrieves the latest scan results for a Cloudforce One scan configuration, including discovered open ports.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
