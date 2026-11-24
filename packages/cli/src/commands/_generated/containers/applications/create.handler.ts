import operation from "../../_operations/containers/applications/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
	);
}
