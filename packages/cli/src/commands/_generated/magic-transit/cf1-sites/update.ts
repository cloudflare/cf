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
		description: {
			kind: "parsed",
			brief: "A human-provided description of the CF1 Site.",
			optional: true,
			parse: String,
		},
		"location-lat": {
			kind: "parsed",
			brief: "Latitude of the CF1 Site.",
			optional: true,
			parse: Number,
		},
		"location-long": {
			kind: "parsed",
			brief: "Longitude of the CF1 Site.",
			optional: true,
			parse: Number,
		},
		"location-name": {
			kind: "parsed",
			brief: "Name of nearest town, city, or village.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"A human-provided name describing the CF1 Site that should be unique within the account.",
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
			brief:
				"Partial update payload for a CF1 Site. All properties are optional; only fields supplied in the request body are modified.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "cf1-site-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <cf1-site-id>",
	describe: "Update CF1 Site",
	usage:
		"$0 magic-transit cf1-sites update <cf1-site-id>\n\nPartially updates a specific CF1 Site for an account. Only the fields included in the request body are modified; omitted fields retain their existing values.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
