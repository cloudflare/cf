import operation from "../_operations/feedback/send.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./send.js";
import { createCommandClient } from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "feedback send",
			classification: {
				safeFlags: [
					"client-cli-delegated",
					"client-cli-mode",
					"client-is-ci",
					"client-is-interactive",
					"client-last-command-outcome",
					"client-package-manager",
					"client-telemetry-enabled",
					"impact",
					"sentiment",
					"type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["schema-version"] === undefined) {
					throw new Error(
						"--schema-version is required (or pass --body with this field set)."
					);
				}
				if (argv["submission-id"] === undefined) {
					argv["submission-id"] = await promptForRequiredField(
						"submission-id",
						"A UUID chosen by the client. Retrying with the same ID does not store the feedback twice."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf feedback send",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/feedback/send`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										actual: resolveFileToken(
											argv["actual"] as string | undefined,
											"actual",
											"text"
										),
										agent: {
											commands: parseObjectArray(
												argv["agent-commands"],
												"agent-commands"
											),
											docs_urls: argv["agent-docs-urls"],
											errors: parseObjectArray(
												argv["agent-errors"],
												"agent-errors"
											),
											model: resolveFileToken(
												argv["agent-model"] as string | undefined,
												"agent-model",
												"text"
											),
											name: resolveFileToken(
												argv["agent-name"] as string | undefined,
												"agent-name",
												"text"
											),
											repro_steps: argv["agent-repro-steps"],
											stats: {
												duration_ms: argv["agent-stats-duration-ms"],
												retries: argv["agent-stats-retries"],
												tool_calls: argv["agent-stats-tool-calls"],
												turns: argv["agent-stats-turns"],
											},
											version: resolveFileToken(
												argv["agent-version"] as string | undefined,
												"agent-version",
												"text"
											),
										},
										attempted: resolveFileToken(
											argv["attempted"] as string | undefined,
											"attempted",
											"text"
										),
										client: {
											agent_detected: resolveFileToken(
												argv["client-agent-detected"] as string | undefined,
												"client-agent-detected",
												"text"
											),
											agent_model_detected: resolveFileToken(
												argv["client-agent-model-detected"] as
													| string
													| undefined,
												"client-agent-model-detected",
												"text"
											),
											arch: resolveFileToken(
												argv["client-arch"] as string | undefined,
												"client-arch",
												"text"
											),
											cli_delegated: argv["client-cli-delegated"],
											cli_mode: argv["client-cli-mode"],
											cli_version: resolveFileToken(
												argv["client-cli-version"] as string | undefined,
												"client-cli-version",
												"text"
											),
											error: {
												message: resolveFileToken(
													argv["client-error-message"] as string | undefined,
													"client-error-message",
													"text"
												),
												stack: resolveFileToken(
													argv["client-error-stack"] as string | undefined,
													"client-error-stack",
													"text"
												),
												telemetry_message: resolveFileToken(
													argv["client-error-telemetry-message"] as
														| string
														| undefined,
													"client-error-telemetry-message",
													"text"
												),
											},
											is_ci: argv["client-is-ci"],
											is_interactive: argv["client-is-interactive"],
											last_command: {
												args_used: argv["client-last-command-args-used"],
												command: resolveFileToken(
													argv["client-last-command-command"] as
														| string
														| undefined,
													"client-last-command-command",
													"text"
												),
												error_codes: argv["client-last-command-error-codes"],
												error_type: resolveFileToken(
													argv["client-last-command-error-type"] as
														| string
														| undefined,
													"client-last-command-error-type",
													"text"
												),
												exit_code: argv["client-last-command-exit-code"],
												http_status: argv["client-last-command-http-status"],
												outcome: argv["client-last-command-outcome"],
											},
											node_major: argv["client-node-major"],
											os: resolveFileToken(
												argv["client-os"] as string | undefined,
												"client-os",
												"text"
											),
											os_release: resolveFileToken(
												argv["client-os-release"] as string | undefined,
												"client-os-release",
												"text"
											),
											package_manager: argv["client-package-manager"],
											telemetry_enabled: argv["client-telemetry-enabled"],
										},
										command: resolveFileToken(
											argv["command"] as string | undefined,
											"command",
											"text"
										),
										expected: resolveFileToken(
											argv["expected"] as string | undefined,
											"expected",
											"text"
										),
										fields: parseJsonMap(argv["fields"], "fields"),
										impact: argv["impact"],
										message: resolveFileToken(
											argv["message"] as string | undefined,
											"message",
											"text"
										),
										product: resolveFileToken(
											argv["product"] as string | undefined,
											"product",
											"text"
										),
										rating: argv["rating"],
										schema_version: argv["schema-version"],
										sent_at: resolveFileToken(
											argv["sent-at"] as string | undefined,
											"sent-at",
											"text"
										),
										sentiment: argv["sentiment"],
										submission_id: resolveFileToken(
											argv["submission-id"] as string | undefined,
											"submission-id",
											"text"
										),
										suggestion: resolveFileToken(
											argv["suggestion"] as string | undefined,
											"suggestion",
											"text"
										),
										task: resolveFileToken(
											argv["task"] as string | undefined,
											"task",
											"text"
										),
										type: argv["type"],
									},
									[["fields"]]
								),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					actual: resolveFileToken(
						argv["actual"] as string | undefined,
						"actual",
						"text"
					),
					agent: {
						commands: parseObjectArray(
							argv["agent-commands"],
							"agent-commands"
						),
						docs_urls: argv["agent-docs-urls"],
						errors: parseObjectArray(argv["agent-errors"], "agent-errors"),
						model: resolveFileToken(
							argv["agent-model"] as string | undefined,
							"agent-model",
							"text"
						),
						name: resolveFileToken(
							argv["agent-name"] as string | undefined,
							"agent-name",
							"text"
						),
						repro_steps: argv["agent-repro-steps"],
						stats: {
							duration_ms: argv["agent-stats-duration-ms"],
							retries: argv["agent-stats-retries"],
							tool_calls: argv["agent-stats-tool-calls"],
							turns: argv["agent-stats-turns"],
						},
						version: resolveFileToken(
							argv["agent-version"] as string | undefined,
							"agent-version",
							"text"
						),
					},
					attempted: resolveFileToken(
						argv["attempted"] as string | undefined,
						"attempted",
						"text"
					),
					client: {
						agent_detected: resolveFileToken(
							argv["client-agent-detected"] as string | undefined,
							"client-agent-detected",
							"text"
						),
						agent_model_detected: resolveFileToken(
							argv["client-agent-model-detected"] as string | undefined,
							"client-agent-model-detected",
							"text"
						),
						arch: resolveFileToken(
							argv["client-arch"] as string | undefined,
							"client-arch",
							"text"
						),
						cli_delegated: argv["client-cli-delegated"],
						cli_mode: argv["client-cli-mode"],
						cli_version: resolveFileToken(
							argv["client-cli-version"] as string | undefined,
							"client-cli-version",
							"text"
						),
						error: {
							message: resolveFileToken(
								argv["client-error-message"] as string | undefined,
								"client-error-message",
								"text"
							),
							stack: resolveFileToken(
								argv["client-error-stack"] as string | undefined,
								"client-error-stack",
								"text"
							),
							telemetry_message: resolveFileToken(
								argv["client-error-telemetry-message"] as string | undefined,
								"client-error-telemetry-message",
								"text"
							),
						},
						is_ci: argv["client-is-ci"],
						is_interactive: argv["client-is-interactive"],
						last_command: {
							args_used: argv["client-last-command-args-used"],
							command: resolveFileToken(
								argv["client-last-command-command"] as string | undefined,
								"client-last-command-command",
								"text"
							),
							error_codes: argv["client-last-command-error-codes"],
							error_type: resolveFileToken(
								argv["client-last-command-error-type"] as string | undefined,
								"client-last-command-error-type",
								"text"
							),
							exit_code: argv["client-last-command-exit-code"],
							http_status: argv["client-last-command-http-status"],
							outcome: argv["client-last-command-outcome"],
						},
						node_major: argv["client-node-major"],
						os: resolveFileToken(
							argv["client-os"] as string | undefined,
							"client-os",
							"text"
						),
						os_release: resolveFileToken(
							argv["client-os-release"] as string | undefined,
							"client-os-release",
							"text"
						),
						package_manager: argv["client-package-manager"],
						telemetry_enabled: argv["client-telemetry-enabled"],
					},
					command: resolveFileToken(
						argv["command"] as string | undefined,
						"command",
						"text"
					),
					expected: resolveFileToken(
						argv["expected"] as string | undefined,
						"expected",
						"text"
					),
					fields: parseJsonMap(argv["fields"], "fields"),
					impact: argv["impact"],
					message: resolveFileToken(
						argv["message"] as string | undefined,
						"message",
						"text"
					),
					product: resolveFileToken(
						argv["product"] as string | undefined,
						"product",
						"text"
					),
					rating: argv["rating"],
					schema_version: argv["schema-version"],
					sent_at: resolveFileToken(
						argv["sent-at"] as string | undefined,
						"sent-at",
						"text"
					),
					sentiment: argv["sentiment"],
					submission_id: resolveFileToken(
						argv["submission-id"] as string | undefined,
						"submission-id",
						"text"
					),
					suggestion: resolveFileToken(
						argv["suggestion"] as string | undefined,
						"suggestion",
						"text"
					),
					task: resolveFileToken(
						argv["task"] as string | undefined,
						"task",
						"text"
					),
					type: argv["type"],
				},
				[["fields"]]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
