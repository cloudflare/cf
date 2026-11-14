import type { LeafCommandMeta } from "../../../lib/command-meta.js";

export default {
	command: "cf durable-objects export",
	name: "export",
	fullPath: ["durable-objects", "export"],
	category: "read",
	description:
		"Download a SQLite-backed Durable Object's database as a single SQLite file. The object is not woken; the file reflects its last write to durable storage. Name the object as your code does: the Worker, the class, and the name passed to getByName(). Use --id for objects created with newUniqueId().",
	usage:
		"cf durable-objects export <worker> <class> (<name> | --id <id>) [--output <file>]",
	arguments: [
		{
			name: "worker",
			position: 0,
			type: "string",
			required: false,
			description:
				"The Worker that defines the Durable Object class. Omit with --namespace-id.",
		},
		{
			name: "class",
			position: 1,
			type: "string",
			required: false,
			description: "The Durable Object class. Omit with --namespace-id.",
		},
		{
			name: "name",
			position: 2,
			type: "string",
			required: false,
			description: "The name the object was created with. Omit with --id.",
		},
	],
	options: [
		{
			name: "id",
			type: "string",
			required: false,
			description: "The object's 64-character hex ID, instead of its name.",
		},
		{
			name: "jurisdiction",
			type: "string",
			required: false,
			description:
				"The jurisdiction of an object selected by name: eu, fedramp or none (default).",
		},
		{
			name: "namespace-id",
			type: "string",
			required: false,
			description:
				"The namespace ID, instead of the Worker and class, when they are ambiguous.",
		},
		{
			name: "output",
			type: "string",
			required: false,
			description:
				"File to write. Defaults to <name or id>.sqlite in the current directory.",
		},
		{
			name: "dry-run",
			type: "boolean",
			required: false,
			description: "Validate and show what would happen without executing",
			default: false,
		},
	],
} satisfies LeafCommandMeta;
