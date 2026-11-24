/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <event-id>",
	describe: "Remove tags from an event (legacy)",
	usage:
		"$0 cloudforce-one threat-intel events legacy tags delete <event-id>\n\nLegacy. Use `threat-intel tags relationships delete` (`DELETE /events/tags/{tag_uuid}/relationships/{rel_uuid}`) instead.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
