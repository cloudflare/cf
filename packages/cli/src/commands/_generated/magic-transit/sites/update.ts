/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"connector-id": {
			kind: "parsed",
			brief: "Magic Connector identifier tag.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		"ha-mode": {
			kind: "boolean",
			brief:
				"Site high availability mode. If set to true, the site can have two connectors and runs in high availability mode.",
			optional: true,
		},
		"location-lat": {
			kind: "parsed",
			brief: "Latitude",
			optional: true,
			parse: String,
		},
		"location-lon": {
			kind: "parsed",
			brief: "Longitude",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the site.",
			optional: true,
			parse: String,
		},
		"secondary-connector-id": {
			kind: "parsed",
			brief:
				"Magic Connector identifier tag. Used when high availability mode is on.",
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
	operands: [{ placeholder: "site-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <site-id>",
	describe: "Update Site",
	usage: "$0 magic-transit sites update <site-id>\n\nUpdate a specific Site.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
