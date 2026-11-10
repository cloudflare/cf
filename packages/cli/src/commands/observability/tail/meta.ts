import type { LeafCommandMeta } from "../../../lib/command-meta.js";

export const filtersDescription =
	'Filters to narrow live tail events. Supports nested groups via kind: \'group\'. Maximum nesting depth is 4. Provide as a JSON object or @path/to/file.json. Shape: {"filterCombination": "and" | "or", "filters": [{...}]}.';

export default {
	command: "cf observability tail",
	name: "tail",
	fullPath: ["observability", "tail"],
	category: "read",
	description:
		"Stream live observability events as newline-delimited JSON. Select --all for all events, --worker for a deployed Worker, --zone for a zone and its subdomains, or --filters for matching observability events. Use --filters alone or with --worker or --zone. Filters accept a JSON object or @file with filterCombination and filters; conditions can be nested in groups. Run cf observability tail --help for filter shapes and examples. Worker events require Workers logs. Each user can run one live tail per Worker and one account live tail. Streaming connections use HTTPS_PROXY and NO_PROXY. --worker requires Worker metadata access. --zone requires Zone read access. Use cf o11y telemetry keys and cf o11y telemetry values to discover fields and values.",
	summary: "Stream observability events",
	search: {
		keywords: [
			"worker logs",
			"live logs",
			"streaming",
			"realtime",
			"console logs",
			"request logs",
			"debugging",
			"exceptions",
			"wrangler tail",
		],
	},
	usage: "cf observability tail [options]",
	arguments: [],
	options: [
		{
			name: "all",
			type: "boolean",
			required: false,
			description: "Stream all observability events",
		},
		{
			name: "worker",
			type: "string",
			required: false,
			description: "Deployed Worker script name",
		},
		{
			name: "filters",
			type: "string",
			required: false,
			description: filtersDescription,
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
