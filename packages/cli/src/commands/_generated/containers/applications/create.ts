import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/containers.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 containers applications create\n\nCreate a Containers application. Use `scheduling_policy: "default"` for a scheduler-backed application. The Containers scheduler maintains the requested instance count and manages deployment configuration, placement, scaling, versions, and rollouts. Use `scheduling_policy: "durable_object"` for a Durable Object-managed application. Each Durable Object creates and manages the lifecycle of its container instance. Supply `name`, `scheduling_policy`, and `durable_objects`, with optional `configuration` and optional top-level `observability` settings. Deployment configuration, scaling, constraints, versions, and rollouts do not apply.'
		)
		.option("configuration-command", {
			type: "string",
			array: true,
			description:
				"The command that runs when the container starts, passed to the entrypoint.\nYou can override this at run-time. If you override only the command,\nit gets passed to the default entrypoint specified in the image.\n",
		})
		.option("configuration-entrypoint", {
			type: "string",
			array: true,
			description:
				"The entry point for the container, specifying the executable to run when the container starts.\nYou can override this at run-time. If you do, the default command from the image is ignored.\nSpecify both entrypoint and command at run-time to completely replace the image defaults.\n",
		})
		.option("configuration-image", {
			type: "string",
			description: "Image url.",
		})
		.option("configuration-instance-type", {
			type: "string",
			description:
				'The instance type configures vCPU, memory, and disk.\n\n- "lite": 1/16 vCPU, 256 MiB memory, 2 GB disk\n- "basic": 1/4 vCPU, 1 GiB memory, 4 GB disk\n- "standard-1": 1/2 vCPU, 4 GiB memory, 8 GB disk\n- "standard-2": 1 vCPU, 6 GiB memory, 12 GB disk\n- "standard-3": 2 vCPU, 8 GiB memory, 16 GB disk\n- "standard-4": 4 vCPU, 12 GiB memory, 20 GB disk\n',
		})
		.option("configuration-observability-logs-enabled", {
			type: "boolean",
			description: "The configuration.observability.logs.enabled field",
		})
		.option("configuration-wrangler-ssh-enabled", {
			type: "boolean",
			description: "The configuration.wrangler_ssh.enabled field",
		})
		.option("configuration-wrangler-ssh-port", {
			type: "number",
			description: "The configuration.wrangler_ssh.port field",
		})
		.option("constraints-jurisdiction", {
			type: "string",
			description:
				'Restricts placement to datacenters in the selected jurisdiction. Choose "eu", "fedramp", or "us". When combined with regions, EU supports EEUR and WEUR while FedRAMP and US support ENAM and WNAM.',
		})
		.option("constraints-regions", {
			type: "string",
			array: true,
			description: "The constraints.regions field",
		})
		.option("instances", {
			type: "number",
			description: "The initial number of deployments to create.",
		})
		.option("max-instances", {
			type: "number",
			description:
				"Sets the maximum number of instances that the application can run.",
		})
		.option("name", {
			type: "string",
			description: "The name for this application.",
		})
		.option("observability-logs-enabled", {
			type: "boolean",
			description: "The observability.logs.enabled field",
		})
		.option("rollout-active-grace-period", {
			type: "number",
			description:
				"Grace period for active instances to stay alive before becoming eligible for shutdown signal due to a rollout, in seconds.\nDefaults to 0.\n",
		})
		.option("scheduling-policy", {
			type: "string",
			description:
				"Selects a scheduler-backed application. Use `default` when the Containers\nscheduler should maintain the requested number of instances and manage deployment\nconfiguration, placement, scaling, versions, and rollouts.\n",
			choices: ["default", "durable_object"],
		})
		.coerce("scheduling-policy", (value: string | undefined) =>
			resolveFileToken(value, "scheduling-policy", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Create a Containers application. Set \`scheduling_policy\` to \`default\` for a scheduler-backed application with deployment configuration, instance counts, constraints, versions, and rollouts. Set it to \`durable_object\` for a Durable Object-managed application where each Durable Object creates and manages the lifecycle of its container instance. For \`durable_object\` requests, supply \`name\`, \`scheduling_policy\`, and \`durable_objects\`, with optional \`configuration\` and top-level \`observability\` settings. ",
		})
		.conflicts("configuration-command", ["configuration-wrangler-ssh-port"])
		.conflicts("configuration-entrypoint", ["configuration-wrangler-ssh-port"])
		.conflicts("configuration-image", ["configuration-wrangler-ssh-port"])
		.conflicts("configuration-instance-type", [
			"configuration-wrangler-ssh-port",
		])
		.conflicts("configuration-wrangler-ssh-port", [
			"configuration-command",
			"configuration-entrypoint",
			"configuration-image",
			"configuration-instance-type",
			"constraints-jurisdiction",
			"constraints-regions",
			"instances",
			"max-instances",
			"rollout-active-grace-period",
		])
		.conflicts("constraints-jurisdiction", ["configuration-wrangler-ssh-port"])
		.conflicts("constraints-regions", ["configuration-wrangler-ssh-port"])
		.conflicts("instances", ["configuration-wrangler-ssh-port"])
		.implies("instances", ["max-instances"])
		.conflicts("max-instances", ["configuration-wrangler-ssh-port"])
		.implies("max-instances", ["instances"])
		.conflicts("rollout-active-grace-period", [
			"configuration-wrangler-ssh-port",
		]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"createApplication">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a new application",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers applications create",
				classification: {
					safeFlags: [
						"configuration-observability-logs-enabled",
						"configuration-wrangler-ssh-enabled",
						"observability-logs-enabled",
						"scheduling-policy",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
											command: argv["configuration-command"],
											entrypoint: argv["configuration-entrypoint"],
											image: resolveFileToken(
												argv["configuration-image"] as string | undefined,
												"configuration-image",
												"text"
											),
											instance_type: resolveFileToken(
												argv["configuration-instance-type"] as
													| string
													| undefined,
												"configuration-instance-type",
												"text"
											),
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.containers.applications.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name for this application."
					);
				}
				if (argv["scheduling-policy"] === undefined) {
					argv["scheduling-policy"] = await promptForRequiredEnumField(
						"scheduling-policy",
						"Selects a scheduler-backed application. Use \`default\` when the Containers scheduler should maintain the requested number of instances and manage deployment configuration, placement, scaling, versions, and rollouts. ",
						["default", "durable_object"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					configuration: {
						command: argv["configuration-command"],
						entrypoint: argv["configuration-entrypoint"],
						image: resolveFileToken(
							argv["configuration-image"] as string | undefined,
							"configuration-image",
							"text"
						),
						instance_type: resolveFileToken(
							argv["configuration-instance-type"] as string | undefined,
							"configuration-instance-type",
							"text"
						),
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
					client.containers.applications.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
