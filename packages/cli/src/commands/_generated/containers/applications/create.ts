import operation from "../../_operations/containers/applications/create.js";
/**
 * create command
 * @generated from apis/overlays/containers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a new application",
	usage:
		'$0 containers applications create\n\nCreate a Containers application. Use `scheduling_policy: "default"` for a scheduler-backed application. The Containers scheduler maintains the requested instance count and manages deployment configuration, placement, scaling, versions, and rollouts. Use `scheduling_policy: "durable_object"` for a Durable Object-managed application. Each Durable Object creates and manages the lifecycle of its container instance. Supply `name`, `scheduling_policy`, and `durable_objects`, with optional `configuration` and optional top-level `observability` settings. Deployment configuration, scaling, constraints, versions, and rollouts do not apply.',
	flags: {
		"configuration-authorized-keys": {
			kind: "parsed",
			brief:
				'The configuration.authorized_keys field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"public_key": string, "name"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"configuration-command": {
			kind: "parsed",
			brief:
				"The command that runs when the container starts, passed to the entrypoint.\nYou can override this at run-time. If you override only the command,\nit gets passed to the default entrypoint specified in the image.\n",
			variadic: true,
			optional: true,
			parse: String,
		},
		"configuration-entrypoint": {
			kind: "parsed",
			brief:
				"The entry point for the container, specifying the executable to run when the container starts.\nYou can override this at run-time. If you do, the default command from the image is ignored.\nSpecify both entrypoint and command at run-time to completely replace the image defaults.\n",
			variadic: true,
			optional: true,
			parse: String,
		},
		"configuration-environment-variables": {
			kind: "parsed",
			brief:
				'Container environment variables. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "value": string}].',
			optional: true,
			parse: String,
		},
		"configuration-image": {
			kind: "parsed",
			brief: "Image url.",
			optional: true,
			parse: String,
		},
		"configuration-instance-type": {
			kind: "parsed",
			brief:
				'The instance type configures vCPU, memory, and disk.\n\n- "lite": 1/16 vCPU, 256 MiB memory, 2 GB disk\n- "basic": 1/4 vCPU, 1 GiB memory, 4 GB disk\n- "standard-1": 1/2 vCPU, 4 GiB memory, 8 GB disk\n- "standard-2": 1 vCPU, 6 GiB memory, 12 GB disk\n- "standard-3": 2 vCPU, 8 GiB memory, 16 GB disk\n- "standard-4": 4 vCPU, 12 GiB memory, 20 GB disk\n',
			optional: true,
			choices: [
				"lite",
				"basic",
				"standard-1",
				"standard-2",
				"standard-3",
				"standard-4",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "configuration-instance-type", "text"),
		},
		"configuration-observability-logs-enabled": {
			kind: "boolean",
			brief: "The configuration.observability.logs.enabled field",
			optional: true,
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
		"durable-objects-namespace-id": {
			kind: "parsed",
			brief:
				"The namespace ID of the durable object namespace to use for this application.",
			optional: true,
			parse: String,
		},
		"durable-objects-class-name": {
			kind: "parsed",
			brief: "The class name of the durable object.",
			optional: true,
			parse: String,
		},
		"durable-objects-script-name": {
			kind: "parsed",
			brief: "The script name where the durable object class is defined.",
			optional: true,
			parse: String,
		},
		instances: {
			kind: "parsed",
			brief: "The initial number of deployments to create.",
			optional: true,
			parse: Number,
		},
		"max-instances": {
			kind: "parsed",
			brief:
				"Sets the maximum number of instances that the application can run.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "The name for this application.",
			optional: true,
			parse: String,
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
		"scheduling-policy": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- `default`: Selects a scheduler-backed application. Use `default` when the Containers\nscheduler should maintain the requested number of instances and manage deployment\nconfiguration, placement, scaling, versions, and rollouts.\n- `durable_object`: Selects a Durable Object-managed application. Each Durable Object creates and\nmanages the lifecycle of its container instance. Configure application-wide\nobservability settings here. Deployment configuration, scaling, placement\nconstraints, versions, and rollouts do not apply.",
			optional: true,
			choices: ["default", "durable_object"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "scheduling-policy", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Create a Containers application. Set `scheduling_policy` to `default` for a scheduler-backed application with deployment configuration, instance counts, constraints, versions, and rollouts. Set it to `durable_object` for a Durable Object-managed application where each Durable Object creates and manages the lifecycle of its container instance. For `durable_object` requests, supply `name`, `scheduling_policy`, and `durable_objects`, with optional `configuration` and top-level `observability` settings. ",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.conflicts("configuration-command", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("configuration-command", [
			"configuration-image",
			"instances",
			"max-instances",
		]);
		rules.conflicts("configuration-entrypoint", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("configuration-entrypoint", [
			"configuration-image",
			"instances",
			"max-instances",
		]);
		rules.conflicts("configuration-environment-variables", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("configuration-environment-variables", [
			"configuration-image",
			"instances",
			"max-instances",
		]);
		rules.conflicts("configuration-image", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("configuration-image", ["instances", "max-instances"]);
		rules.conflicts("configuration-instance-type", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("configuration-instance-type", [
			"configuration-image",
			"instances",
			"max-instances",
		]);
		rules.conflicts("configuration-observability-logs-enabled", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("configuration-observability-logs-enabled", [
			"configuration-image",
			"instances",
			"max-instances",
		]);
		rules.conflicts("configuration-wrangler-ssh-enabled", [
			"configuration-command",
			"configuration-entrypoint",
			"configuration-environment-variables",
			"configuration-image",
			"configuration-instance-type",
			"configuration-observability-logs-enabled",
			"constraints-regions",
			"instances",
			"max-instances",
			"rollout-active-grace-period",
		]);
		rules.conflicts("configuration-wrangler-ssh-port", [
			"configuration-command",
			"configuration-entrypoint",
			"configuration-environment-variables",
			"configuration-image",
			"configuration-instance-type",
			"configuration-observability-logs-enabled",
			"constraints-regions",
			"instances",
			"max-instances",
			"rollout-active-grace-period",
		]);
		rules.conflicts("constraints-regions", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("constraints-regions", [
			"configuration-image",
			"instances",
			"max-instances",
		]);
		rules.conflicts("durable-objects-namespace-id", [
			"durable-objects-class-name",
			"durable-objects-script-name",
		]);
		rules.conflicts("durable-objects-class-name", [
			"durable-objects-namespace-id",
		]);
		rules.implies("durable-objects-class-name", [
			"durable-objects-script-name",
		]);
		rules.conflicts("durable-objects-script-name", [
			"durable-objects-namespace-id",
		]);
		rules.implies("durable-objects-script-name", [
			"durable-objects-class-name",
		]);
		rules.conflicts("instances", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("instances", ["configuration-image", "max-instances"]);
		rules.conflicts("max-instances", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("max-instances", ["configuration-image", "instances"]);
		rules.conflicts("rollout-active-grace-period", [
			"configuration-wrangler-ssh-enabled",
			"configuration-wrangler-ssh-port",
		]);
		rules.implies("rollout-active-grace-period", [
			"configuration-image",
			"instances",
			"max-instances",
		]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers applications create",
				classification: {
					safeFlags: [
						"configuration-instance-type",
						"configuration-observability-logs-enabled",
						"configuration-wrangler-ssh-enabled",
						"observability-logs-enabled",
						"scheduling-policy",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name for this application."
						);
					}
					if (argv["scheduling-policy"] === undefined) {
						argv["scheduling-policy"] = await promptForRequiredEnumField(
							"scheduling-policy",
							"Variant descriptions: - \`default\`: Selects a scheduler-backed application. Use \`default\` when the Containers scheduler should maintain the requested number of instances and manage deployment configuration, placement, scaling, versions, and rollouts. - \`durable_object\`: Selects a Durable Object-managed application. Each Durable Object creates and manages the lifecycle of its container instance. Configure application-wide observability settings here. Deployment configuration, scaling, placement constraints, versions, and rollouts do not apply.",
							["default", "durable_object"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf containers applications create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/applications`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										configuration: {
											authorized_keys: parseObjectArray(
												argv["configuration-authorized-keys"],
												"configuration-authorized-keys"
											),
											command: argv["configuration-command"],
											entrypoint: argv["configuration-entrypoint"],
											environment_variables: parseObjectArray(
												argv["configuration-environment-variables"],
												"configuration-environment-variables"
											),
											image: resolveFileToken(
												argv["configuration-image"] as string | undefined,
												"configuration-image",
												"text"
											),
											instance_type: argv["configuration-instance-type"],
											observability: {
												logs: {
													enabled:
														argv["configuration-observability-logs-enabled"],
												},
											},
											wrangler_ssh: {
												enabled: argv["configuration-wrangler-ssh-enabled"],
												port: argv["configuration-wrangler-ssh-port"],
											},
										},
										constraints: {
											jurisdiction: resolveFileToken(
												argv["constraints-jurisdiction"] as string | undefined,
												"constraints-jurisdiction",
												"text"
											),
											regions: argv["constraints-regions"],
										},
										durable_objects: {
											namespace_id: resolveFileToken(
												argv["durable-objects-namespace-id"] as
													| string
													| undefined,
												"durable-objects-namespace-id",
												"text"
											),
											class_name: resolveFileToken(
												argv["durable-objects-class-name"] as
													| string
													| undefined,
												"durable-objects-class-name",
												"text"
											),
											script_name: resolveFileToken(
												argv["durable-objects-script-name"] as
													| string
													| undefined,
												"durable-objects-script-name",
												"text"
											),
										},
										instances: argv["instances"],
										max_instances: argv["max-instances"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										observability: {
											logs: {
												enabled: argv["observability-logs-enabled"],
											},
										},
										rollout_active_grace_period:
											argv["rollout-active-grace-period"],
										scheduling_policy: argv["scheduling-policy"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					configuration: {
						authorized_keys: parseObjectArray(
							argv["configuration-authorized-keys"],
							"configuration-authorized-keys"
						),
						command: argv["configuration-command"],
						entrypoint: argv["configuration-entrypoint"],
						environment_variables: parseObjectArray(
							argv["configuration-environment-variables"],
							"configuration-environment-variables"
						),
						image: resolveFileToken(
							argv["configuration-image"] as string | undefined,
							"configuration-image",
							"text"
						),
						instance_type: argv["configuration-instance-type"],
						observability: {
							logs: {
								enabled: argv["configuration-observability-logs-enabled"],
							},
						},
						wrangler_ssh: {
							enabled: argv["configuration-wrangler-ssh-enabled"],
							port: argv["configuration-wrangler-ssh-port"],
						},
					},
					constraints: {
						jurisdiction: resolveFileToken(
							argv["constraints-jurisdiction"] as string | undefined,
							"constraints-jurisdiction",
							"text"
						),
						regions: argv["constraints-regions"],
					},
					durable_objects: {
						namespace_id: resolveFileToken(
							argv["durable-objects-namespace-id"] as string | undefined,
							"durable-objects-namespace-id",
							"text"
						),
						class_name: resolveFileToken(
							argv["durable-objects-class-name"] as string | undefined,
							"durable-objects-class-name",
							"text"
						),
						script_name: resolveFileToken(
							argv["durable-objects-script-name"] as string | undefined,
							"durable-objects-script-name",
							"text"
						),
					},
					instances: argv["instances"],
					max_instances: argv["max-instances"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					observability: {
						logs: {
							enabled: argv["observability-logs-enabled"],
						},
					},
					rollout_active_grace_period: argv["rollout-active-grace-period"],
					scheduling_policy: argv["scheduling-policy"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
