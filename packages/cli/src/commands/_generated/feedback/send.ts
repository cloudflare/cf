import operation from "../_operations/feedback/send.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * send command
 * @generated from apis/overlays/feedback.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 feedback send\n\nReport a problem with Cloudflare products, the cf CLI, or the Cloudflare MCP server and its tools to the Cloudflare team. While you work, keep track of what went wrong: failed calls, errors, wrong or confusing results, missing commands or tools. Send feedback near the end of the task if it hit a Cloudflare problem: several failed attempts, an error that looks like a Cloudflare bug, or a workaround you had to find. Also send feedback at the user's request. Skip it if the task went fine or the problem was in the user's own code. Send at most once per task; never send to test the endpoint or to log progress. Describe what was attempted, what was expected and what happened. Leave out secrets, API tokens, personal data, account or zone IDs and full conversations. After a successful submission, if you are an agent, tell the user at the next natural break, such as the end of the current turn, that you sent feedback to Cloudflare. Include the `submission_id`."
		)
		.option("actual", { type: "string", description: "What happened instead." })
		.option("agent-commands", {
			type: "string",
			description:
				'Commands the agent ran. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"command": string, "duration_ms"?: number, "exit_code"?: number, "flags"?: [string]}]. ? marks optional keys.',
		})
		.option("agent-docs-urls", {
			type: "string",
			array: true,
			description: "Documentation the agent read.",
		})
		.option("agent-errors", {
			type: "string",
			description:
				'Errors the agent hit. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"message": string, "code"?: string, "command"?: string}]. ? marks optional keys.',
		})
		.option("agent-model", {
			type: "string",
			description: "The model the agent used.",
		})
		.option("agent-name", {
			type: "string",
			description: "The agent's name, such as `claude-code`.",
		})
		.option("agent-repro-steps", {
			type: "string",
			array: true,
			description: "Steps to reproduce the problem.",
		})
		.option("agent-stats-duration-ms", {
			type: "number",
			description: "How long the task took, in milliseconds.",
		})
		.option("agent-stats-retries", {
			type: "number",
			description: "Retries made.",
		})
		.option("agent-stats-tool-calls", {
			type: "number",
			description: "Tool calls made.",
		})
		.option("agent-stats-turns", {
			type: "number",
			description: "Conversation turns.",
		})
		.option("agent-version", {
			type: "string",
			description: "The agent's version.",
		})
		.option("attempted", { type: "string", description: "What was tried." })
		.option("client-agent-detected", {
			type: "string",
			description: "The coding agent the CLI detected, such as `claude-code`.",
		})
		.option("client-agent-model-detected", {
			type: "string",
			description: "The model the CLI detected.",
		})
		.option("client-arch", {
			type: "string",
			description: "The CPU architecture.",
		})
		.option("client-cli-delegated", {
			type: "boolean",
			description: "Whether the command was delegated to another tool.",
		})
		.option("client-cli-mode", {
			type: "string",
			description: "How the CLI was run.",
			choices: ["ci", "interactive", "non-interactive"],
		})
		.coerce("client-cli-mode", (value) =>
			resolveFileToken(value, "client-cli-mode", "text")
		)
		.option("client-cli-version", {
			type: "string",
			description: "The cf CLI version.",
		})
		.option("client-error-message", {
			type: "string",
			description: "The error message.",
		})
		.option("client-error-stack", {
			type: "string",
			description: "The stack trace.",
		})
		.option("client-error-telemetry-message", {
			type: "string",
			description: "The error message as recorded by telemetry.",
		})
		.option("client-is-ci", {
			type: "boolean",
			description: "Whether the CLI ran in CI.",
		})
		.option("client-is-interactive", {
			type: "boolean",
			description: "Whether the CLI ran in an interactive terminal.",
		})
		.option("client-last-command-args-used", {
			type: "string",
			array: true,
			description: "The flag names used, without values.",
		})
		.option("client-last-command-command", {
			type: "string",
			description: "The command path, such as `workers deploy`.",
		})
		.option("client-last-command-error-codes", {
			type: "string",
			array: true,
			description: "Cloudflare API error codes returned.",
		})
		.option("client-last-command-error-type", {
			type: "string",
			description: "The kind of error, if any.",
		})
		.option("client-last-command-exit-code", {
			type: "number",
			description: "The command's exit code.",
		})
		.option("client-last-command-http-status", {
			type: "number",
			description: "The HTTP status of the failed API call, if any.",
		})
		.option("client-last-command-outcome", {
			type: "string",
			description: "How the command ended.",
			choices: ["success", "error", "cancelled"],
		})
		.coerce("client-last-command-outcome", (value) =>
			resolveFileToken(value, "client-last-command-outcome", "text")
		)
		.option("client-node-major", {
			type: "number",
			description: "The Node.js major version.",
		})
		.option("client-os", {
			type: "string",
			description: "The operating system.",
		})
		.option("client-os-release", {
			type: "string",
			description: "The operating system release.",
		})
		.option("client-package-manager", {
			type: "string",
			description: "The package manager that installed the CLI.",
			choices: ["npm", "pnpm", "yarn", "bun", "unknown"],
		})
		.coerce("client-package-manager", (value) =>
			resolveFileToken(value, "client-package-manager", "text")
		)
		.option("client-telemetry-enabled", {
			type: "boolean",
			description: "Whether CLI telemetry was on.",
		})
		.option("command", {
			type: "string",
			description: "The cf command it is about, such as `workers deploy`.",
		})
		.option("expected", {
			type: "string",
			description: "What was expected to happen.",
		})
		.option("fields", {
			type: "string",
			description:
				'Any other details as string values, keyed by lowercase names such as `region`. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
		})
		.option("impact", {
			type: "string",
			description: "How much it got in the way.",
			choices: ["blocked", "worked_around", "friction", "none"],
		})
		.coerce("impact", (value) => resolveFileToken(value, "impact", "text"))
		.option("message", {
			type: "string",
			description: "The feedback, in the user's or agent's words.",
		})
		.option("product", {
			type: "string",
			description:
				"The Cloudflare product it is about, such as `workers` or `r2`.",
		})
		.option("rating", {
			type: "number",
			description: "An overall rating from 1 to 5.",
		})
		.option("schema-version", {
			type: "number",
			description: "Version of this request format.",
		})
		.option("sent-at", {
			type: "string",
			description: "When the client sent the feedback.",
		})
		.option("sentiment", {
			type: "string",
			description: "The overall sentiment.",
			choices: ["positive", "neutral", "negative"],
		})
		.coerce("sentiment", (value) =>
			resolveFileToken(value, "sentiment", "text")
		)
		.option("submission-id", {
			type: "string",
			description:
				"A UUID chosen by the client. Retrying with the same ID does not store the feedback twice.",
		})
		.option("suggestion", {
			type: "string",
			description: "What would have helped.",
		})
		.option("task", {
			type: "string",
			description: "What the user was trying to do.",
		})
		.option("type", {
			type: "string",
			description: "What kind of feedback this is.",
			choices: ["bug", "friction", "feature", "docs", "praise", "other"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "send",
	describe: "Send feedback",
	builder,
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
				} satisfies ArgClassification<Args>,
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
};

export default command;
