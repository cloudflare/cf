/**
 * as-set command
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
			placeholder: "asn",
			brief: "Retrieves all AS-SETs that the given AS is a member of.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "as-set <asn>",
	describe: "Get IRR AS-SETs that an AS is a member of",
	usage:
		"$0 radar entities asns as-set <asn>\n\nRetrieves Internet Routing Registry AS-SETs that an AS is a member of.",
	...parameters,
	loader: () => import("./as-set.handler.js"),
});

export default command;
