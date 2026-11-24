/**
 * graphql command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "graphql",
	describe: "Run a GraphQL aggregation over events",
	usage:
		"$0 cloudforce-one threat-intel events graphql\n\nRuns a GraphQL aggregation query over events. Supports grouping by multiple fields, date range filters, and aggregation across datasets.",
	...parameters,
	loader: () => import("./graphql.handler.js"),
});

export default command;
