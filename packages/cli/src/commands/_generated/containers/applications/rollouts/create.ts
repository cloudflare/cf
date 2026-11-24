import operation from "../../../_operations/containers/applications/rollouts/create.js";
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
	command: "create <application-id>",
	describe: "Create a new rollout for an application",
	usage:
		'$0 containers applications rollouts create <application-id>\n\nCreates a rollout to update the application\'s configuration across instances with minimal downtime. Rollouts apply only to scheduler-backed applications with `scheduling_policy: "default"`. Versions and rollouts do not apply to applications with `scheduling_policy: "durable_object"`.',
	flags: {
		description: {
			kind: "parsed",
			brief: "Description of the rollout process.",
			optional: true,
			parse: String,
		},
		kind: {
			kind: "parsed",
			brief:
				'Kind of the rollout process. Defaults to "full_auto".\n - "full_auto": For rolling rollouts, starts progressing steps upon rollout creation. For new_instances rollouts, advances percentage targets automatically after target-version health is observed.\n - "full_manual": Requires manually progressing each step in the rollout using the UpdateRollout\'s action parameter.\n',
			default: "full_auto",
			choices: ["full_auto", "full_manual"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "kind", "text"),
		},
		percentage: {
			kind: "parsed",
			brief:
				'Initial target version percentage (0-100). Version sync actively replaces instances to match.\nRequired when strategy is "new_instances" and kind is "full_manual". When strategy is "new_instances" and kind is "full_auto", omitted percentage starts at 10% or the smallest percentage that targets at least one instance. Unused for "rolling".\n',
			optional: true,
			parse: Number,
		},
		"step-percentage": {
			kind: "parsed",
			brief:
				'Percentage of rollout to increase in each step when "steps" is absent. Applicable values: 5, 10, 20, 25, 50, 100.\nThese create rollouts with 20, 10, 5, 4, 2, 1 steps respectively.\nOnly valid for "rolling" strategy.\n',
			optional: true,
			parse: Number,
		},
		steps: {
			kind: "parsed",
			brief:
				'Steps defining the rollout process, used when "step_percentage" is absent.\nSpecify only one of "step_percentage" or "steps" when creating a rollout.\n"steps" allow granular control over each step.\nOnly valid for "rolling" strategy. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"description": string, "step_size": {...}}].',
			optional: true,
			parse: String,
		},
		strategy: {
			kind: "parsed",
			brief:
				'Strategy used for the rollout.\n- "rolling": Step-based rollout with health gates. Actively replaces instances to reach each step\'s target percentage.\n- "new_instances": Percentage control over version distribution. Version sync actively replaces instances to match the configured percentage. The "full_auto" kind advances through fixed percentage targets after target-version health is observed.\n',
			optional: true,
			choices: ["rolling", "new_instances"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "strategy", "text"),
		},
		"target-configuration-authorized-keys": {
			kind: "parsed",
			brief:
				'The target_configuration.authorized_keys field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"public_key": string, "name"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"target-configuration-command": {
			kind: "parsed",
			brief:
				"The command that runs when the container starts, passed to the entrypoint.\nYou can override this at run-time. If you override only the command,\nit gets passed to the default entrypoint specified in the image.\n",
			variadic: true,
			optional: true,
			parse: String,
		},
		"target-configuration-entrypoint": {
			kind: "parsed",
			brief:
				"The entry point for the container, specifying the executable to run when the container starts.\nYou can override this at run-time. If you do, the default command from the image is ignored.\nSpecify both entrypoint and command at run-time to completely replace the image defaults.\n",
			variadic: true,
			optional: true,
			parse: String,
		},
		"target-configuration-environment-variables": {
			kind: "parsed",
			brief:
				'Container environment variables. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "value": string}].',
			optional: true,
			parse: String,
		},
		"target-configuration-image": {
			kind: "parsed",
			brief: "Image url.",
			optional: true,
			parse: String,
		},
		"target-configuration-instance-type": {
			kind: "parsed",
			brief:
				'The instance type configures vCPU, memory, and disk.\n\n- "lite": 1/16 vCPU, 256 MiB memory, 2 GB disk\n- "basic": 1/4 vCPU, 1 GiB memory, 4 GB disk\n- "standard-1": 1/2 vCPU, 4 GiB memory, 8 GB disk\n- "standard-2": 1 vCPU, 6 GiB memory, 12 GB disk\n- "standard-3": 2 vCPU, 8 GiB memory, 16 GB disk\n- "standard-4": 4 vCPU, 12 GiB memory, 20 GB disk\n',
			default: "lite",
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
				resolveFileToken(value, "target-configuration-instance-type", "text"),
		},
		"target-configuration-observability-logs-enabled": {
			kind: "boolean",
			brief: "The target_configuration.observability.logs.enabled field",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request body to create a new rollout for a scheduler-backed application.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers applications rollouts create",
				classification: {
					safeFlags: [
						"kind",
						"strategy",
						"target-configuration-instance-type",
						"target-configuration-observability-logs-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["description"] === undefined) {
						argv["description"] = await promptForRequiredField(
							"description",
							"Description of the rollout process."
						);
					}
					if (argv["strategy"] === undefined) {
						argv["strategy"] = await promptForRequiredEnumField(
							"strategy",
							'Strategy used for the rollout. - "rolling": Step-based rollout with health gates. Actively replaces instances to reach each step\'s target percentage. - "new_instances": Percentage control over version distribution. Version sync actively replaces instances to match the configured percentage. The "full_auto" kind advances through fixed percentage targets after target-version health is observed. ',
							["rolling", "new_instances"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf containers applications rollouts create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/applications/${argv["application-id"] == null ? "<application-id>" : encodeURIComponent(String(argv["application-id"]))}/rollouts`,
						pathParams: {
							"application-id": String(argv["application-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										kind: argv["kind"],
										percentage: argv["percentage"],
										step_percentage: argv["step-percentage"],
										steps: parseObjectArray(argv["steps"], "steps"),
										strategy: argv["strategy"],
										target_configuration: {
											authorized_keys: parseObjectArray(
												argv["target-configuration-authorized-keys"],
												"target-configuration-authorized-keys"
											),
											command: argv["target-configuration-command"],
											entrypoint: argv["target-configuration-entrypoint"],
											environment_variables: parseObjectArray(
												argv["target-configuration-environment-variables"],
												"target-configuration-environment-variables"
											),
											image: resolveFileToken(
												argv["target-configuration-image"] as
													| string
													| undefined,
												"target-configuration-image",
												"text"
											),
											instance_type: argv["target-configuration-instance-type"],
											observability: {
												logs: {
													enabled:
														argv[
															"target-configuration-observability-logs-enabled"
														],
												},
											},
										},
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							application_id: argv["application-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					kind: argv["kind"],
					percentage: argv["percentage"],
					step_percentage: argv["step-percentage"],
					steps: parseObjectArray(argv["steps"], "steps"),
					strategy: argv["strategy"],
					target_configuration: {
						authorized_keys: parseObjectArray(
							argv["target-configuration-authorized-keys"],
							"target-configuration-authorized-keys"
						),
						command: argv["target-configuration-command"],
						entrypoint: argv["target-configuration-entrypoint"],
						environment_variables: parseObjectArray(
							argv["target-configuration-environment-variables"],
							"target-configuration-environment-variables"
						),
						image: resolveFileToken(
							argv["target-configuration-image"] as string | undefined,
							"target-configuration-image",
							"text"
						),
						instance_type: argv["target-configuration-instance-type"],
						observability: {
							logs: {
								enabled:
									argv["target-configuration-observability-logs-enabled"],
							},
						},
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						application_id: argv["application-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
