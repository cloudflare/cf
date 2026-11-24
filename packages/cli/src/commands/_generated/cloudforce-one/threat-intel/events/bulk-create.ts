/**
 * bulk-create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		data: {
			kind: "parsed",
			brief:
				'The data field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"category": string, "date": string, "event": string, "raw": {...}, "tlp": string, ...more}].',
			optional: true,
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief: "The datasetId field",
			optional: true,
			parse: String,
		},
		"include-created-events": {
			kind: "boolean",
			brief:
				"When true, response includes array of created event UUIDs and shard IDs. Useful for tracking which events were created and where.",
			optional: true,
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
	command: "bulk-create",
	describe: "Create events in bulk",
	usage:
		"$0 cloudforce-one threat-intel events bulk-create\n\nCreates multiple events in one dataset. `datasetId` is required; to find dataset IDs, use `threat-intel datasets list`. Set `includeCreatedEvents` to return the UUIDs of the created events.",
	...parameters,
	loader: () => import("./bulk-create.handler.js"),
});

export default command;
