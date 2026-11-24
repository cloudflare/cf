/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "test-result-id",
			brief: "Unique identifier for a specific traceroute test.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <test-result-id>",
	describe: "Get details for a specific traceroute test run",
	usage:
		"$0 zero-trust dex test-results traceroute network-path get <test-result-id>\n\nGet a breakdown of hops and performance metrics for a specific traceroute test run",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
