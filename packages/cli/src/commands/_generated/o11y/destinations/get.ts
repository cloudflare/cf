/**
 * get command
 * @generated from apis/overlays/o11y.ts
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
			placeholder: "slug",
			brief: "The destination's slug, which is its name.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <slug>",
	describe: "Get Destination",
	usage:
		"$0 o11y destinations get <slug>\n\nGet a Workers Observability Telemetry Destination.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
