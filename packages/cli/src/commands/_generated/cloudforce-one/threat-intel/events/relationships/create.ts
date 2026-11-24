/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"child-ids": {
			kind: "parsed",
			brief:
				"Array of UUIDs for child events. Single child = 1:1 relationship, multiple = 1:many relationships",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief: "Dataset identifier where the events are stored",
			optional: true,
			parse: String,
		},
		"parent-id": {
			kind: "parsed",
			brief:
				"UUID of the parent event that will be the source of the relationship",
			optional: true,
			parse: String,
		},
		"relationship-type": {
			kind: "parsed",
			brief: "Type of relationship to create between parent and child events",
			optional: true,
			choices: ["related_to", "caused_by", "attributed_to"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "relationship-type", "text"),
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create event relationships",
	usage:
		"$0 cloudforce-one threat-intel events relationships create\n\nCreates directed relationships of type `relationshipType` from a parent event to one or more child events in the same dataset.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
