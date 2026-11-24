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
		"dataset-id": { kind: "parsed", brief: "Dataset UUID.", parse: String },
		"auto-create-type": {
			kind: "boolean",
			brief:
				"Global flag to automatically create indicator types if they don't exist. Individual indicators can override this with their own autoCreateType flag. When false, a non-analytics dataset still accepts pre-approved types (the same list event create accepts, such as BITCOIN or ERC-20) and registers them on first use. Analytics datasets do not check registered types.",
			optional: true,
		},
		indicators: {
			kind: "parsed",
			brief:
				'The indicators field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"indicatorType": string, "value": string, "autoCreateType"?: boolean, "relatedEvents"?: [{...}], "tags"?: [(string | {...})], ...more}]. ? marks optional keys.',
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-create",
	describe: "Create indicators in bulk",
	usage:
		"$0 cloudforce-one threat-intel indicators bulk-create\n\nCreates multiple indicators in a dataset in one request. Set `autoCreateType` to create any indicator types that don't exist.",
	...parameters,
	loader: () => import("./bulk-create.handler.js"),
});

export default command;
