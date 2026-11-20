import type { CommandMeta } from "../../lib/command-meta.js";

export default [
	{
		command: "cf update",
		name: "update",
		fullPath: ["update"],
		category: "action",
		description: "Update the current installation of cf",
		usage: "cf update [target] [options]",
		search: { keywords: ["upgrade", "self-update"] },
		arguments: [
			{
				name: "target",
				position: 0,
				type: "string",
				required: false,
				description: "Release tag or exact version to install",
			},
		],
		options: [
			{
				name: "dry-run",
				type: "boolean",
				required: false,
				description: "Show the package manager command without running it",
				default: false,
			},
		],
	},
] satisfies CommandMeta[];
