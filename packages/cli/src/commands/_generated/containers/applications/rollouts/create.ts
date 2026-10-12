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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 containers applications rollouts create <application-id>\n\nCreates a rollout to update the application\'s configuration across instances with minimal downtime. Rollouts apply only to scheduler-backed applications with `scheduling_policy: "default"`. Versions and rollouts do not apply to applications with `scheduling_policy: "durable_object"`.'
		)
		.positional("application-id", {
			type: "string",
			description:
				"An Application ID represents an identifier of an application.",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "Description of the rollout process.",
		})
		.option("kind", {
			type: "string",
			description:
				'Kind of the rollout process. Defaults to "full_auto".\n - "full_auto": For rolling rollouts, starts progressing steps upon rollout creation. For new_instances rollouts, advances percentage targets automatically after target-version health is observed.\n - "full_manual": Requires manually progressing each step in the rollout using the UpdateRollout\'s action parameter.\n',
			choices: ["full_auto", "full_manual"],
			default: "full_auto",
		})
		.coerce("kind", (value) => resolveFileToken(value, "kind", "text"))
		.option("percentage", {
			type: "number",
			description:
				'Initial target version percentage (0-100). Version sync actively replaces instances to match.\nRequired when strategy is "new_instances" and kind is "full_manual". When strategy is "new_instances" and kind is "full_auto", omitted percentage starts at 10% or the smallest percentage that targets at least one instance. Unused for "rolling".\n',
		})
		.option("step-percentage", {
			type: "number",
			description:
				'Percentage of rollout to increase in each step when "steps" is absent. Applicable values: 5, 10, 20, 25, 50, 100.\nThese create rollouts with 20, 10, 5, 4, 2, 1 steps respectively.\nOnly valid for "rolling" strategy.\n',
		})
		.option("steps", {
			type: "string",
			description:
				'Steps defining the rollout process, used when "step_percentage" is absent.\nSpecify only one of "step_percentage" or "steps" when creating a rollout.\n"steps" allow granular control over each step.\nOnly valid for "rolling" strategy.\n. Provide as a JSON array of objects or @path/to/file.json.',
		})
		.option("strategy", {
			type: "string",
			description:
				'Strategy used for the rollout.\n- "rolling": Step-based rollout with health gates. Actively replaces instances to reach each step\'s target percentage.\n- "new_instances": Percentage control over version distribution. Version sync actively replaces instances to match the configured percentage. The "full_auto" kind advances through fixed percentage targets after target-version health is observed.\n',
			choices: ["rolling", "new_instances"],
		})
		.coerce("strategy", (value) => resolveFileToken(value, "strategy", "text"))
		.option("target-configuration-command", {
			type: "string",
			array: true,
			description:
				"The command that runs when the container starts, passed to the entrypoint.\nYou can override this at run-time. If you override only the command,\nit gets passed to the default entrypoint specified in the image.\n",
		})
		.option("target-configuration-entrypoint", {
			type: "string",
			array: true,
			description:
				"The entry point for the container, specifying the executable to run when the container starts.\nYou can override this at run-time. If you do, the default command from the image is ignored.\nSpecify both entrypoint and command at run-time to completely replace the image defaults.\n",
		})
		.option("target-configuration-image", {
			type: "string",
			description: "Image url.",
		})
		.option("target-configuration-instance-type", {
			type: "string",
			description:
				'The instance type configures vCPU, memory, and disk.\n\n- "lite": 1/16 vCPU, 256 MiB memory, 2 GB disk\n- "basic": 1/4 vCPU, 1 GiB memory, 4 GB disk\n- "standard-1": 1/2 vCPU, 4 GiB memory, 8 GB disk\n- "standard-2": 1 vCPU, 6 GiB memory, 12 GB disk\n- "standard-3": 2 vCPU, 8 GiB memory, 16 GB disk\n- "standard-4": 4 vCPU, 12 GiB memory, 20 GB disk\n',
			default: "lite",
		})
		.option("target-configuration-observability-logs-enabled", {
			type: "boolean",
			description: "The target_configuration.observability.logs.enabled field",
			default: false,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body to create a new rollout for a scheduler-backed application.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"createApplicationRollout">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <application-id>",
	describe: "Create a new rollout for an application",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers applications rollouts create",
				classification: {
					safeFlags: [
						"kind",
						"strategy",
						"target-configuration-observability-logs-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
											command: argv["target-configuration-command"],
											entrypoint: argv["target-configuration-entrypoint"],
											image: resolveFileToken(
												argv["target-configuration-image"] as
													| string
													| undefined,
												"target-configuration-image",
												"text"
											),
											instance_type: resolveFileToken(
												argv["target-configuration-instance-type"] as
													| string
													| undefined,
												"target-configuration-instance-type",
												"text"
											),
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.containers.applications.rollouts.create({
							...bodyData,
							account_id: accountId,
							application_id: argv["application-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
						command: argv["target-configuration-command"],
						entrypoint: argv["target-configuration-entrypoint"],
						image: resolveFileToken(
							argv["target-configuration-image"] as string | undefined,
							"target-configuration-image",
							"text"
						),
						instance_type: resolveFileToken(
							argv["target-configuration-instance-type"] as string | undefined,
							"target-configuration-instance-type",
							"text"
						),
						observability: {
							logs: {
								enabled:
									argv["target-configuration-observability-logs-enabled"],
							},
						},
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.containers.applications.rollouts.create({
						...bodyData,
						account_id: accountId,
						application_id: argv["application-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
