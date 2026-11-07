import type { CommandMeta } from "../../lib/command-meta.js";

export default [
	{
		command: "cf feedback",
		name: "feedback",
		fullPath: ["feedback"],
		category: "action",
		description: "Send feedback about cf to the cf team",
		summary:
			"Send a note, structured fields or an agent's JSON report about cf. Every field is optional.",
		usage: "cf feedback [note] [options]",
		arguments: [
			{
				name: "note",
				position: 0,
				type: "string",
				required: false,
				description:
					"What happened or what would have helped; - reads it from stdin",
			},
		],
		options: [
			{
				name: "field",
				type: "string",
				required: false,
				description: "A key=value detail; repeat for more",
			},
			{
				name: "input-json",
				type: "string",
				required: false,
				description:
					"A JSON report from a file, or - for stdin (put it last, or write --input-json=-); meant for agents",
			},
			{
				name: "context",
				type: "boolean",
				required: false,
				description:
					"Attach CLI context: version, OS and detected agent. Follows the telemetry setting; --no-context never attaches it",
			},
			{
				name: "dry-run",
				type: "boolean",
				required: false,
				description: "Print the submission without sending it",
				default: false,
			},
		],
		search: {
			keywords: [
				"feedback",
				"bug report",
				"report a problem",
				"feature request",
				"agent report",
			],
		},
	},
] satisfies CommandMeta[];
