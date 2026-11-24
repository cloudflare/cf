/**
 * get-banners command
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
	command: "get-banners <config-id>",
	describe: "Get the Latest Banner Grab Result",
	usage:
		"$0 cloudforce-one scans results get-banners <config-id>\n\nRetrieves the latest banner grab results for a Cloudforce One scan configuration, including service banners from open ports.",
	...parameters,
	loader: () => import("./get-banners.handler.js"),
});

export default command;
