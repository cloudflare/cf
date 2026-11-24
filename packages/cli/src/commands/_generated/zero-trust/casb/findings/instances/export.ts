/**
 * export command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		archived: {
			kind: "boolean",
			brief: "Filter for archived status.",
			optional: true,
		},
		"max-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or before the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"min-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or after the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		orders: {
			kind: "parsed",
			brief:
				'Ordering specifications for the export. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"direction": "asc" | "desc", "name": "asset.name" | "affliction_date"}].',
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief: "A search term.",
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
			brief: "Filter specification for finding instance exports.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "finding-namespace-id",
			brief:
				"Identifies the finding whose instances to export, in the form \`<integration_id>-<finding_type_id>\`. Take \`integration.id\` and \`finding.id\` from the finding in the List posture findings response and join them with a hyphen.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "export <finding-namespace-id>",
	describe: "Create a finding instances export",
	usage:
		"$0 zero-trust casb findings instances export <finding-namespace-id>\n\nCreates a CSV export for Finding instances and accepts optional filters in the payload. Identify the finding as `<integration_id>-<finding_type_id>`: join the `integration.id` and `finding.id` of the finding (from the List posture findings response) with a hyphen.",
	...parameters,
	loader: () => import("./export.handler.js"),
});

export default command;
