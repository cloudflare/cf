/**
 * edit command
 * @generated from apis/overlays/containers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"configuration-authorized-keys": {
			kind: "parsed",
			brief:
				'The configuration.authorized_keys field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"public_key": string, "name"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"configuration-wrangler-ssh-enabled": {
			kind: "boolean",
			brief: "The configuration.wrangler_ssh.enabled field",
			optional: true,
		},
		"configuration-wrangler-ssh-port": {
			kind: "parsed",
			brief: "The configuration.wrangler_ssh.port field",
			optional: true,
			parse: Number,
		},
		"constraints-jurisdiction": {
			kind: "parsed",
			brief:
				'Restricts placement to datacenters in the selected jurisdiction. Choose "eu", "fedramp", or "us". When combined with regions, EU supports EEUR and WEUR while FedRAMP and US support ENAM and WNAM.',
			optional: true,
			parse: String,
		},
		"constraints-regions": {
			kind: "parsed",
			brief: "The constraints.regions field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"max-instances": {
			kind: "parsed",
			brief:
				"Maximum number of instances that an autoscaling application can run.",
			optional: true,
			parse: Number,
		},
		"observability-logs-enabled": {
			kind: "boolean",
			brief: "The observability.logs.enabled field",
			optional: true,
		},
		"rollout-active-grace-period": {
			kind: "parsed",
			brief:
				"Grace period for active instances to stay alive before becoming eligible for shutdown signal due to a rollout, in seconds.\nDefaults to 0.\n",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request body for modifying a Containers application without replacing its instances. Durable Object-managed applications support only top-level observability.logs.enabled. The other fields apply to scheduler-backed applications, where deployment configuration changes such as image, resource allocation, command, and environment variables require an application rollout. ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "application-id",
			brief: "An Application ID represents an identifier of an application.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <application-id>",
	describe: "Modify an application",
	usage:
		"$0 containers applications edit <application-id>\n\nModifies a single application by id. Durable Object-managed application settings are published to runtime metadata without creating deployments or rollouts. Top-level `observability` for these applications supports only `logs.enabled`. The supported fields depend on the existing application's scheduling policy. For scheduler-backed applications, changes that replace instance deployment configuration, including the image, require a rollout.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
