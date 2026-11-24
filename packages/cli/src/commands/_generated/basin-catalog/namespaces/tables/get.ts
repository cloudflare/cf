/**
 * get command
 * @generated from apis/overlays/basin-catalog.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Specifies the R2 bucket name.",
			parse: String,
		},
		namespace: {
			kind: "parsed",
			brief:
				'The namespace identifier.\nFor nested namespaces, use %1F as separator (e.g., "bronze%1Fanalytics").',
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "table-name",
			brief: "The table name within the given namespace.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <table-name>",
	describe: "Get table details",
	usage:
		"$0 basin-catalog namespaces tables get <table-name>\n\nReturns full Apache Iceberg metadata for a single table: schema, partition specs, sort orders, properties, and recent snapshot history. Designed for catalog introspection UIs that need per-table details without holding R2 credentials. The `metadata.snapshots`, `metadata.snapshot-log`, and `metadata.metadata-log` arrays are pruned to the most recent 10 entries by `timestamp-ms`. Use `total_snapshots` and `returned_snapshots` to surface the truncation to end users.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
