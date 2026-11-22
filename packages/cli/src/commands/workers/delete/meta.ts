import type { LeafOverrideMeta } from "#lib/command-meta.js";

export const description =
	"Delete a Worker and its associated versions and deployments. Container applications are only deleted with confirmation or --delete-containers.";
export const workerDescription =
	"Identifier for the Worker, which can be ID or name.";
export const deleteWithReferencesDescription =
	"Delete the Worker even when other Workers still reference it. Service bindings in those Workers may be left broken. Durable Object namespaces implemented by the deleted Worker are deleted even if other Workers reference them.";
export const deleteContainersDescription =
	"Also delete Container applications owned by this Worker.";
export const dryRunDescription =
	"Preview the deletion without making API requests.";
export const forceDescription = "Skip confirmation (useful in scripts and CI)";
export const workerAliases = ["script-name", "worker-id"];

export default {
	description,
	usage: "cf workers delete [worker] [options]",
	arguments: [
		{
			name: "worker",
			position: 0,
			type: "string",
			required: false,
			description: workerDescription,
		},
	],
	options: [
		{
			name: "worker",
			type: "string",
			required: false,
			description: workerDescription,
			alias: workerAliases,
		},
		{
			name: "delete-with-references",
			type: "boolean",
			required: false,
			description: deleteWithReferencesDescription,
		},
		{
			name: "delete-containers",
			type: "boolean",
			required: false,
			description: deleteContainersDescription,
			default: false,
		},
		{
			name: "dry-run",
			type: "boolean",
			required: false,
			description: dryRunDescription,
			default: false,
		},
		{
			name: "force",
			type: "boolean",
			required: false,
			description: forceDescription,
			alias: "f",
			default: false,
		},
	],
} satisfies LeafOverrideMeta;
