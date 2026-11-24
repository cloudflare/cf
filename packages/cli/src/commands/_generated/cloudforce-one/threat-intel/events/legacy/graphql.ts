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
	describe: "Run a GraphQL aggregation over events (legacy)",
	usage:
		"$0 cloudforce-one threat-intel events legacy graphql\n\nLegacy. Use `threat-intel events graphql` (`POST /events/graphql`) instead. Both commands run the same query.",
	...parameters,
	loader: () => import("./graphql.handler.js"),
});

export default command;
