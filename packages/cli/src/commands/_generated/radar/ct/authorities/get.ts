/**
 * get command
 * @generated from apis/overlays/radar.ts
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
			brief: "Format in which results will be returned.",
			values: ["JSON", "CSV"],
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
			placeholder: "ca-slug",
			brief: "Certificate authority SHA256 fingerprint.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <ca-slug>",
	describe: "Get certificate authority details",
	usage:
		"$0 radar ct authorities get <ca-slug>\n\nRetrieves the requested CA information.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
