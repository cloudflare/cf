import type { CommandMeta } from "#lib/command-meta.js";

export default [
	{
		command: "cf workers connections apply",
		name: "apply",
		fullPath: ["workers", "connections", "apply"],
		category: "action",
		description:
			"Create or reconcile private draft identity connectors without uploading a Worker",
		usage: "cf workers connections apply [options]",
		arguments: [],
		options: [
			{
				name: "prebuilt",
				type: "boolean",
				required: false,
				default: false,
				description:
					"Use existing Build Output Specification files without building",
			},
			{
				name: "worker",
				type: "string",
				required: false,
				description:
					"Name of the Worker in the Build Output to use (defaults to the default Worker)",
			},
			{
				name: "state",
				type: "string",
				required: false,
				default: "cloudflare.identity.json",
				description:
					"Durable connector state to retain with infrastructure configuration",
			},
			{
				name: "dry-run",
				type: "boolean",
				required: false,
				default: false,
				description:
					"Validate configuration without provisioning, registration, consent or tokens",
			},
		],
	},

	{
		command: "cf workers connections setup",
		name: "setup",
		fullPath: ["workers", "connections", "setup"],
		category: "action",
		description:
			"Authorize a new app-owned connection in an account-authenticated browser",
		usage: "cf workers connections setup <binding> [options]",
		arguments: [
			{
				position: 0,
				name: "binding",
				type: "string",
				required: true,
				description: "App-owned identity binding in Build Output",
			},
		],
		options: [
			{
				name: "prebuilt",
				type: "boolean",
				required: false,
				default: false,
				description: "Use existing Build Output without building",
			},
			{
				name: "worker",
				type: "string",
				required: false,
				description: "Worker in Build Output",
			},
			{
				name: "preview-id",
				type: "string",
				required: false,
				description:
					"Actual deployed Preview ID; required for Preview Build Output",
			},
			{
				name: "operation",
				type: "string",
				required: false,
				description: "Retained setup UUID to resume after a lost response",
			},
			{
				name: "state",
				type: "string",
				required: false,
				default: "cloudflare.identity.json",
				description: "Retained connector infrastructure state",
			},
			{
				name: "browser",
				type: "boolean",
				required: false,
				default: true,
				description: "Open the account-authenticated hosted setup page",
			},
			{
				name: "wait",
				type: "boolean",
				required: false,
				default: true,
				description: "Wait for safe completion status",
			},
			{
				name: "dry-run",
				type: "boolean",
				required: false,
				default: false,
				description:
					"Validate without registration, consent or token side effects",
			},
		],
	},
	{
		command: "cf workers connections status",
		name: "status",
		fullPath: ["workers", "connections", "status"],
		category: "read",
		description:
			"Read credential-free app setup status for the initiating account",
		usage: "cf workers connections status <operation> [options]",
		arguments: [
			{
				position: 0,
				name: "operation",
				type: "string",
				required: true,
				description: "Setup operation UUID",
			},
		],
		options: [
			{
				name: "dry-run",
				type: "boolean",
				required: false,
				default: false,
				description:
					"Validate arguments without account authentication or status requests",
			},
			{
				name: "account-id",
				type: "string",
				required: false,
				description: "Initiating Cloudflare account",
			},
		],
	},
] satisfies CommandMeta[];
