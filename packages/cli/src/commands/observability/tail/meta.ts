import type { LeafCommandMeta } from "../../../lib/command-meta.js";

export default {
	command: "cf observability tail",
	name: "tail",
	fullPath: ["observability", "tail"],
	category: "read",
	description:
		"Stream sampled observability events across the account as newline-delimited JSON. Use --worker to select a deployed Worker; Workers logs must be enabled. Filters and shortcuts are combined with --filter-combination (default: and). Groups can nest up to four levels. String comparisons are case-sensitive. Filter operations: eq, neq, gt, gte, lt, lte, includes, not_includes, starts_with, ends_with, regex, in, not_in, exists, is_null. Use a comma-separated string for in/not_in; omit value for exists/is_null. Use cf o11y telemetry keys and cf o11y telemetry values to discover fields and values.",
	summary: "Stream observability events",
	usage: "cf observability tail [options]",
	arguments: [],
	options: [
		{
			name: "worker",
			type: "string",
			required: false,
			description:
				"Deployed Worker script name (including any environment suffix)",
		},
		{
			name: "filters",
			type: "string",
			required: false,
			description:
				'Telemetry filters as a JSON array or @path/to/file.json. Shape: [{key: string, type: "string" | "number" | "boolean", operation: string, value?: string | number | boolean} | {kind: "group", filterCombination: "and" | "or", filters: [...]}].',
		},
		{
			name: "status",
			type: "string",
			array: true,
			required: false,
			enum: ["ok", "error", "canceled"],
			description: "Match events by Worker outcome",
		},
		{
			name: "method",
			type: "string",
			array: true,
			required: false,
			description: "Match events by HTTP trigger method",
		},
		{
			name: "search",
			type: "string",
			required: false,
			description: "Match text in event messages",
		},
		{
			name: "version-id",
			type: "string",
			required: false,
			description: "Match events by Worker version ID",
		},
		{
			name: "filter-combination",
			type: "string",
			required: false,
			default: "and",
			enum: ["and", "or"],
			description: "Combine telemetry filters with and/or",
		},
		{
			name: "dry-run",
			type: "boolean",
			required: false,
			default: false,
			description: "Preview the live tail request",
		},
	],
} satisfies LeafCommandMeta;
