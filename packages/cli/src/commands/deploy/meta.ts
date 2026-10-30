import { secretsFileDescription } from "./secrets-file-description.js";
import type { CommandMeta } from "../../lib/command-meta.js";

export default [
	{
		command: "cf deploy",
		name: "deploy",
		fullPath: ["deploy"],
		category: "action",
		description:
			"Deploy a Worker, static site, or full-stack application to Cloudflare",
		usage: "cf deploy [options]",
		search: {
			keywords: [
				"pages",
				"project",
				"website",
				"static",
				"site",
				"assets",
				"frontend",
				"full-stack",
			],
		},
		arguments: [],
		options: [
			{
				name: "durable-objects-code-update-mode",
				type: "string",
				required: false,
				description:
					"When active Durable Objects adopt new code (default: deferred)",
				enum: ["immediate", "deferred"],
			},
			{
				name: "durable-objects-code-update-max-delay",
				type: "number",
				required: false,
				description:
					"Maximum deferred update delay in seconds (default: 300, maximum: 86400)",
			},
			{
				name: "prebuilt",
				type: "boolean",
				required: false,
				description:
					"Deploy existing Build Output Specification files without building",
				default: false,
			},
			{
				name: "tag",
				type: "string",
				required: false,
				description: "A tag to associate with this Worker Version",
			},
			{
				name: "message",
				type: "string",
				required: false,
				description: "A message to associate with this Worker Version",
			},
			{
				name: "secrets-file",
				type: "string",
				required: false,
				description: secretsFileDescription,
			},
			{
				name: "dry-run",
				type: "boolean",
				required: false,
				description:
					"Build a project and run checks without actually uploading the Worker",
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
				name: "provision",
				type: "boolean",
				required: false,
				description:
					"Automatically provision resources for bindings that need them",
				default: true,
			},
			{
				name: "dispatch-namespace",
				type: "string",
				required: false,
				description:
					"Name of a dispatch namespace to deploy the Worker to (Workers for Platforms)",
			},
			{
				name: "containers-rollout",
				type: "string",
				required: false,
				description:
					"Rollout strategy for Container changes. Immediate rolls out to all instances in one step; none leaves deployed Containers unchanged.",
				enum: ["immediate", "gradual", "none"],
			},
		],
	},
] satisfies CommandMeta[];
