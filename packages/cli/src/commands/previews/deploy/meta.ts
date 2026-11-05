import type { LeafCommandMeta } from "../../../lib/command-meta.js";

export default {
	command: "cf previews deploy",
	name: "deploy",
	fullPath: ["previews", "deploy"],
	category: "action",
	description: "Deploy a Worker Preview",
	usage: "cf previews deploy [directory] [options]",
	arguments: [
		{
			name: "directory",
			position: 0,
			type: "string",
			required: false,
			description:
				"Directory containing prebuilt static assets. Use only for assets-only projects; projects with server-side code require a delegated build.",
		},
	],
	options: [
		{
			name: "preview-name",
			type: "string",
			required: false,
			description:
				"Preview name. Defaults to the current CI or Git branch; required if no branch is available.",
		},
		{
			name: "prebuilt",
			type: "boolean",
			required: false,
			description:
				"Use existing Preview Build Output Specification files without building",
			default: false,
		},
		{
			name: "worker",
			type: "string",
			required: false,
			description:
				"Name of the Worker in the Build Output to use (defaults to the default Worker)",
		},
		{
			name: "dry-run",
			type: "boolean",
			required: false,
			description: "Parse arguments and show the command without executing it",
			default: false,
		},
	],
} satisfies LeafCommandMeta;
