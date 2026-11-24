/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		tags: {
			kind: "parsed",
			brief: "The tags field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "event-id", brief: "Event UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <event-id>",
	describe: "Add tags to an event (legacy)",
	usage:
		"$0 cloudforce-one threat-intel events legacy tags create <event-id>\n\nLegacy. Use `threat-intel tags relationships create` (`POST /events/tags/{tag_uuid}/relationships`) instead.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
