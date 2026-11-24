import operation from "../../../_operations/containers/applications/rollouts/create.js";
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
											argv["target-configuration-image"] as string | undefined,
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
							enabled: argv["target-configuration-observability-logs-enabled"],
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
	);
}
