import operation from "../_operations/feedback/send.js";
/**
 * send command
 * @generated from apis/overlays/feedback.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "send",
	describe: "Send feedback",
	usage:
		"$0 feedback send\n\nReport a problem with Cloudflare products, the cf CLI, or the Cloudflare MCP server and its tools to the Cloudflare team. While you work, keep track of what went wrong: failed calls, errors, wrong or confusing results, missing commands or tools. Send feedback near the end of the task if it hit a Cloudflare problem: several failed attempts, an error that looks like a Cloudflare bug, or a workaround you had to find. Also send feedback at the user's request. Skip it if the task went fine or the problem was in the user's own code. Send at most once per task; never send to test the endpoint or to log progress. Describe what was attempted, what was expected and what happened. Leave out secrets, API tokens, personal data, account or zone IDs and full conversations. After a successful submission, if you are an agent, tell the user at the next natural break, such as the end of the current turn, that you sent feedback to Cloudflare. Include the `submission_id`.",
	flags: {
		actual: {
			kind: "parsed",
			brief: "What happened instead.",
			optional: true,
			parse: String,
		},
		"agent-commands": {
			kind: "parsed",
			brief:
				'Commands the agent ran. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"command": string, "duration_ms"?: number, "exit_code"?: number, "flags"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"agent-docs-urls": {
			kind: "parsed",
			brief: "Documentation the agent read.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"agent-errors": {
			kind: "parsed",
			brief:
				'Errors the agent hit. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"message": string, "code"?: string, "command"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"agent-model": {
			kind: "parsed",
			brief: "The model the agent used.",
			optional: true,
			parse: String,
		},
		"agent-name": {
			kind: "parsed",
			brief: "The agent's name, such as `claude-code`.",
			optional: true,
			parse: String,
		},
		"agent-repro-steps": {
			kind: "parsed",
			brief: "Steps to reproduce the problem.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"agent-stats-duration-ms": {
			kind: "parsed",
			brief: "How long the task took, in milliseconds.",
			optional: true,
			parse: Number,
		},
		"agent-stats-retries": {
			kind: "parsed",
			brief: "Retries made.",
			optional: true,
			parse: Number,
		},
		"agent-stats-tool-calls": {
			kind: "parsed",
			brief: "Tool calls made.",
			optional: true,
			parse: Number,
		},
		"agent-stats-turns": {
			kind: "parsed",
			brief: "Conversation turns.",
			optional: true,
			parse: Number,
		},
		"agent-version": {
			kind: "parsed",
			brief: "The agent's version.",
			optional: true,
			parse: String,
		},
		attempted: {
			kind: "parsed",
			brief: "What was tried.",
			optional: true,
			parse: String,
		},
		"client-agent-detected": {
			kind: "parsed",
			brief: "The coding agent the CLI detected, such as `claude-code`.",
			optional: true,
			parse: String,
		},
		"client-agent-model-detected": {
			kind: "parsed",
			brief: "The model the CLI detected.",
			optional: true,
			parse: String,
		},
		"client-arch": {
			kind: "parsed",
			brief: "The CPU architecture.",
			optional: true,
			parse: String,
		},
		"client-cli-delegated": {
			kind: "boolean",
			brief: "Whether the command was delegated to another tool.",
			optional: true,
		},
		"client-cli-mode": {
			kind: "parsed",
			brief: "How the CLI was run.",
			optional: true,
			choices: ["ci", "interactive", "non-interactive"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "client-cli-mode", "text"),
		},
		"client-cli-version": {
			kind: "parsed",
			brief: "The cf CLI version.",
			optional: true,
			parse: String,
		},
		"client-error-message": {
			kind: "parsed",
			brief: "The error message.",
			optional: true,
			parse: String,
		},
		"client-error-stack": {
			kind: "parsed",
			brief: "The stack trace.",
			optional: true,
			parse: String,
		},
		"client-error-telemetry-message": {
			kind: "parsed",
			brief: "The error message as recorded by telemetry.",
			optional: true,
			parse: String,
		},
		"client-is-ci": {
			kind: "boolean",
			brief: "Whether the CLI ran in CI.",
			optional: true,
		},
		"client-is-interactive": {
			kind: "boolean",
			brief: "Whether the CLI ran in an interactive terminal.",
			optional: true,
		},
		"client-last-command-args-used": {
			kind: "parsed",
			brief: "The flag names used, without values.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"client-last-command-command": {
			kind: "parsed",
			brief: "The command path, such as `workers deploy`.",
			optional: true,
			parse: String,
		},
		"client-last-command-error-codes": {
			kind: "parsed",
			brief: "Cloudflare API error codes returned.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"client-last-command-error-type": {
			kind: "parsed",
			brief: "The kind of error, if any.",
			optional: true,
			parse: String,
		},
		"client-last-command-exit-code": {
			kind: "parsed",
			brief: "The command's exit code.",
			optional: true,
			parse: Number,
		},
		"client-last-command-http-status": {
			kind: "parsed",
			brief: "The HTTP status of the failed API call, if any.",
			optional: true,
			parse: Number,
		},
		"client-last-command-outcome": {
			kind: "parsed",
			brief: "How the command ended.",
			optional: true,
			choices: ["success", "error", "cancelled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "client-last-command-outcome", "text"),
		},
		"client-node-major": {
			kind: "parsed",
			brief: "The Node.js major version.",
			optional: true,
			parse: Number,
		},
		"client-os": {
			kind: "parsed",
			brief: "The operating system.",
			optional: true,
			parse: String,
		},
		"client-os-release": {
			kind: "parsed",
			brief: "The operating system release.",
			optional: true,
			parse: String,
		},
		"client-package-manager": {
			kind: "parsed",
			brief: "The package manager that installed the CLI.",
			optional: true,
			choices: ["npm", "pnpm", "yarn", "bun", "unknown"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "client-package-manager", "text"),
		},
		"client-telemetry-enabled": {
			kind: "boolean",
			brief: "Whether CLI telemetry was on.",
			optional: true,
		},
		command: {
			kind: "parsed",
			brief: "The cf command it is about, such as `workers deploy`.",
			optional: true,
			parse: String,
		},
		expected: {
			kind: "parsed",
			brief: "What was expected to happen.",
			optional: true,
			parse: String,
		},
		fields: {
			kind: "parsed",
			brief:
				'Any other details as string values, keyed by lowercase names such as `region`. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		impact: {
			kind: "parsed",
			brief: "How much it got in the way.",
			optional: true,
			choices: ["blocked", "worked_around", "friction", "none"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "impact", "text"),
		},
		message: {
			kind: "parsed",
			brief: "The feedback, in the user's or agent's words.",
			optional: true,
			parse: String,
		},
		product: {
			kind: "parsed",
			brief: "The Cloudflare product it is about, such as `workers` or `r2`.",
			optional: true,
			parse: String,
		},
		rating: {
			kind: "parsed",
			brief: "An overall rating from 1 to 5.",
			optional: true,
			parse: Number,
		},
		"schema-version": {
			kind: "parsed",
			brief: "Version of this request format.",
			optional: true,
			parse: Number,
		},
		"sent-at": {
			kind: "parsed",
			brief: "When the client sent the feedback.",
			optional: true,
			parse: String,
		},
		sentiment: {
			kind: "parsed",
			brief: "The overall sentiment.",
			optional: true,
			choices: ["positive", "neutral", "negative"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "sentiment", "text"),
		},
		"submission-id": {
			kind: "parsed",
			brief:
				"A UUID chosen by the client. Retrying with the same ID does not store the feedback twice.",
			optional: true,
			parse: String,
		},
		suggestion: {
			kind: "parsed",
			brief: "What would have helped.",
			optional: true,
			parse: String,
		},
		task: {
			kind: "parsed",
			brief: "What the user was trying to do.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "What kind of feedback this is.",
			optional: true,
			choices: ["bug", "friction", "feature", "docs", "praise", "other"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
		),
});

export default command;
