/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"x-magic-new-hc-target": {
			kind: "parsed",
			brief:
				"If true, the health check target in the response body will be presented using the new object format. Defaults to false.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "cf-interconnect-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <cf-interconnect-id>",
	describe: "List interconnect Details",
	usage:
		"$0 magic-transit cf-interconnects get <cf-interconnect-id>\n\nLists details for a specific interconnect.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
