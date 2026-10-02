import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-gateway gateways update <gateway-id>\n\nUpdates the configuration of an AI Gateway, such as its caching, rate limiting, logging, and authentication settings."
		)
		.positional("gateway-id", {
			type: "string",
			description: "Unique identifier of the AI Gateway within the account.",
			demandOption: true,
		})
		.option("authentication", {
			type: "boolean",
			description: "The authentication field",
		})
		.option("byok-only", {
			type: "boolean",
			description:
				"Requires customer-provided provider credentials and prevents fallback to Unified Billing.",
		})
		.option("cache-invalidate-on-update", {
			type: "boolean",
			description: "The cache_invalidate_on_update field",
		})
		.option("cache-ttl", { type: "number", description: "The cache_ttl field" })
		.option("collect-logs", {
			type: "boolean",
			description: "The collect_logs field",
		})
		.option("guardrails-prompt-p1", {
			type: "string",
			description: "The guardrails.prompt.P1 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s1", {
			type: "string",
			description: "The guardrails.prompt.S1 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s10", {
			type: "string",
			description: "The guardrails.prompt.S10 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s11", {
			type: "string",
			description: "The guardrails.prompt.S11 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s12", {
			type: "string",
			description: "The guardrails.prompt.S12 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s13", {
			type: "string",
			description: "The guardrails.prompt.S13 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s2", {
			type: "string",
			description: "The guardrails.prompt.S2 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s3", {
			type: "string",
			description: "The guardrails.prompt.S3 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s4", {
			type: "string",
			description: "The guardrails.prompt.S4 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s5", {
			type: "string",
			description: "The guardrails.prompt.S5 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s6", {
			type: "string",
			description: "The guardrails.prompt.S6 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s7", {
			type: "string",
			description: "The guardrails.prompt.S7 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s8", {
			type: "string",
			description: "The guardrails.prompt.S8 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-prompt-s9", {
			type: "string",
			description: "The guardrails.prompt.S9 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-p1", {
			type: "string",
			description: "The guardrails.response.P1 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s1", {
			type: "string",
			description: "The guardrails.response.S1 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s10", {
			type: "string",
			description: "The guardrails.response.S10 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s11", {
			type: "string",
			description: "The guardrails.response.S11 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s12", {
			type: "string",
			description: "The guardrails.response.S12 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s13", {
			type: "string",
			description: "The guardrails.response.S13 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s2", {
			type: "string",
			description: "The guardrails.response.S2 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s3", {
			type: "string",
			description: "The guardrails.response.S3 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s4", {
			type: "string",
			description: "The guardrails.response.S4 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s5", {
			type: "string",
			description: "The guardrails.response.S5 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s6", {
			type: "string",
			description: "The guardrails.response.S6 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s7", {
			type: "string",
			description: "The guardrails.response.S7 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s8", {
			type: "string",
			description: "The guardrails.response.S8 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("guardrails-response-s9", {
			type: "string",
			description: "The guardrails.response.S9 field",
			choices: ["FLAG", "BLOCK"],
		})
		.option("log-classification", {
			type: "boolean",
			description: "The log_classification field",
		})
		.option("log-management", {
			type: "number",
			description: "The log_management field",
		})
		.option("log-management-strategy", {
			type: "string",
			description: "The log_management_strategy field",
			choices: ["STOP_INSERTING", "DELETE_OLDEST"],
		})
		.option("logpush", { type: "boolean", description: "The logpush field" })
		.option("logpush-public-key", {
			type: "string",
			description: "The logpush_public_key field",
		})
		.option("otel", {
			type: "string",
			description:
				"The otel field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("rate-limiting-interval", {
			type: "number",
			description: "The rate_limiting_interval field",
		})
		.option("rate-limiting-limit", {
			type: "number",
			description: "The rate_limiting_limit field",
		})
		.option("rate-limiting-technique", {
			type: "string",
			description: "The rate_limiting_technique field",
			choices: ["fixed", "sliding"],
		})
		.option("retry-backoff", {
			type: "string",
			description: "Backoff strategy for retry delays",
			choices: ["constant", "linear", "exponential"],
		})
		.option("retry-delay", {
			type: "number",
			description: "Delay between retry attempts in milliseconds (0-60000)",
		})
		.option("retry-max-attempts", {
			type: "number",
			description: "Maximum number of retry attempts for failed requests (1-5)",
		})
		.option("spend-limits-enabled", {
			type: "boolean",
			description: "The spend_limits.enabled field",
		})
		.option("store-id", { type: "string", description: "The store_id field" })
		.option("stripe-authorization", {
			type: "string",
			description: "The stripe.authorization field",
		})
		.option("workers-ai-billing-mode", {
			type: "string",
			description:
				"Controls how Workers AI inference calls routed through this gateway are billed. 'postpaid' bills the account directly through Workers AI; 'unified' deducts credits via AI Gateway using neuron-based pricing and delegates billing to AI Gateway.",
			choices: ["postpaid", "unified"],
		})
		.option("zdr", { type: "boolean", description: "The zdr field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = ["stripe-authorization"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["stripe-authorization"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --stripe-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <gateway-id>",
	describe: "Update a gateway",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway gateways update",
				classification: {
					safeFlags: [
						"authentication",
						"byok-only",
						"cache-invalidate-on-update",
						"collect-logs",
						"guardrails-prompt-p1",
						"guardrails-prompt-s1",
						"guardrails-prompt-s10",
						"guardrails-prompt-s11",
						"guardrails-prompt-s12",
						"guardrails-prompt-s13",
						"guardrails-prompt-s2",
						"guardrails-prompt-s3",
						"guardrails-prompt-s4",
						"guardrails-prompt-s5",
						"guardrails-prompt-s6",
						"guardrails-prompt-s7",
						"guardrails-prompt-s8",
						"guardrails-prompt-s9",
						"guardrails-response-p1",
						"guardrails-response-s1",
						"guardrails-response-s10",
						"guardrails-response-s11",
						"guardrails-response-s12",
						"guardrails-response-s13",
						"guardrails-response-s2",
						"guardrails-response-s3",
						"guardrails-response-s4",
						"guardrails-response-s5",
						"guardrails-response-s6",
						"guardrails-response-s7",
						"guardrails-response-s8",
						"guardrails-response-s9",
						"log-classification",
						"log-management-strategy",
						"logpush",
						"rate-limiting-technique",
						"retry-backoff",
						"spend-limits-enabled",
						"workers-ai-billing-mode",
						"zdr",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway gateways update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}`,
						pathParams: { "gateway-id": String(argv["gateway-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										authentication: argv["authentication"],
										byok_only: argv["byok-only"],
										cache_invalidate_on_update:
											argv["cache-invalidate-on-update"],
										cache_ttl: argv["cache-ttl"],
										collect_logs: argv["collect-logs"],
										guardrails: {
											prompt: {
												P1: resolveFileToken(
													argv["guardrails-prompt-p1"] as string | undefined,
													"guardrails-prompt-p1",
													"text"
												),
												S1: resolveFileToken(
													argv["guardrails-prompt-s1"] as string | undefined,
													"guardrails-prompt-s1",
													"text"
												),
												S10: resolveFileToken(
													argv["guardrails-prompt-s10"] as string | undefined,
													"guardrails-prompt-s10",
													"text"
												),
												S11: resolveFileToken(
													argv["guardrails-prompt-s11"] as string | undefined,
													"guardrails-prompt-s11",
													"text"
												),
												S12: resolveFileToken(
													argv["guardrails-prompt-s12"] as string | undefined,
													"guardrails-prompt-s12",
													"text"
												),
												S13: resolveFileToken(
													argv["guardrails-prompt-s13"] as string | undefined,
													"guardrails-prompt-s13",
													"text"
												),
												S2: resolveFileToken(
													argv["guardrails-prompt-s2"] as string | undefined,
													"guardrails-prompt-s2",
													"text"
												),
												S3: resolveFileToken(
													argv["guardrails-prompt-s3"] as string | undefined,
													"guardrails-prompt-s3",
													"text"
												),
												S4: resolveFileToken(
													argv["guardrails-prompt-s4"] as string | undefined,
													"guardrails-prompt-s4",
													"text"
												),
												S5: resolveFileToken(
													argv["guardrails-prompt-s5"] as string | undefined,
													"guardrails-prompt-s5",
													"text"
												),
												S6: resolveFileToken(
													argv["guardrails-prompt-s6"] as string | undefined,
													"guardrails-prompt-s6",
													"text"
												),
												S7: resolveFileToken(
													argv["guardrails-prompt-s7"] as string | undefined,
													"guardrails-prompt-s7",
													"text"
												),
												S8: resolveFileToken(
													argv["guardrails-prompt-s8"] as string | undefined,
													"guardrails-prompt-s8",
													"text"
												),
												S9: resolveFileToken(
													argv["guardrails-prompt-s9"] as string | undefined,
													"guardrails-prompt-s9",
													"text"
												),
											},
											response: {
												P1: resolveFileToken(
													argv["guardrails-response-p1"] as string | undefined,
													"guardrails-response-p1",
													"text"
												),
												S1: resolveFileToken(
													argv["guardrails-response-s1"] as string | undefined,
													"guardrails-response-s1",
													"text"
												),
												S10: resolveFileToken(
													argv["guardrails-response-s10"] as string | undefined,
													"guardrails-response-s10",
													"text"
												),
												S11: resolveFileToken(
													argv["guardrails-response-s11"] as string | undefined,
													"guardrails-response-s11",
													"text"
												),
												S12: resolveFileToken(
													argv["guardrails-response-s12"] as string | undefined,
													"guardrails-response-s12",
													"text"
												),
												S13: resolveFileToken(
													argv["guardrails-response-s13"] as string | undefined,
													"guardrails-response-s13",
													"text"
												),
												S2: resolveFileToken(
													argv["guardrails-response-s2"] as string | undefined,
													"guardrails-response-s2",
													"text"
												),
												S3: resolveFileToken(
													argv["guardrails-response-s3"] as string | undefined,
													"guardrails-response-s3",
													"text"
												),
												S4: resolveFileToken(
													argv["guardrails-response-s4"] as string | undefined,
													"guardrails-response-s4",
													"text"
												),
												S5: resolveFileToken(
													argv["guardrails-response-s5"] as string | undefined,
													"guardrails-response-s5",
													"text"
												),
												S6: resolveFileToken(
													argv["guardrails-response-s6"] as string | undefined,
													"guardrails-response-s6",
													"text"
												),
												S7: resolveFileToken(
													argv["guardrails-response-s7"] as string | undefined,
													"guardrails-response-s7",
													"text"
												),
												S8: resolveFileToken(
													argv["guardrails-response-s8"] as string | undefined,
													"guardrails-response-s8",
													"text"
												),
												S9: resolveFileToken(
													argv["guardrails-response-s9"] as string | undefined,
													"guardrails-response-s9",
													"text"
												),
											},
										},
										log_classification: argv["log-classification"],
										log_management: argv["log-management"],
										log_management_strategy: resolveFileToken(
											argv["log-management-strategy"] as string | undefined,
											"log-management-strategy",
											"text"
										),
										logpush: argv["logpush"],
										logpush_public_key: resolveFileToken(
											argv["logpush-public-key"] as string | undefined,
											"logpush-public-key",
											"text"
										),
										otel: parseObjectArray(argv["otel"], "otel"),
										rate_limiting_interval: argv["rate-limiting-interval"],
										rate_limiting_limit: argv["rate-limiting-limit"],
										rate_limiting_technique: resolveFileToken(
											argv["rate-limiting-technique"] as string | undefined,
											"rate-limiting-technique",
											"text"
										),
										retry_backoff: resolveFileToken(
											argv["retry-backoff"] as string | undefined,
											"retry-backoff",
											"text"
										),
										retry_delay: argv["retry-delay"],
										retry_max_attempts: argv["retry-max-attempts"],
										spend_limits: {
											enabled: argv["spend-limits-enabled"],
										},
										store_id: resolveFileToken(
											argv["store-id"] as string | undefined,
											"store-id",
											"text"
										),
										stripe: {
											authorization: resolveFileToken(
												argv["stripe-authorization"] as string | undefined,
												"stripe-authorization",
												"text"
											),
										},
										workers_ai_billing_mode: resolveFileToken(
											argv["workers-ai-billing-mode"] as string | undefined,
											"workers-ai-billing-mode",
											"text"
										),
										zdr: argv["zdr"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/ai-gateway/gateways/${encodeURIComponent(String(argv["gateway-id"]))}`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["cache-invalidate-on-update"] === undefined) {
					throw new Error(
						"--cache-invalidate-on-update is required (or pass --body with this field set)."
					);
				}
				if (argv["cache-ttl"] === undefined) {
					throw new Error(
						"--cache-ttl is required (or pass --body with this field set)."
					);
				}
				if (argv["collect-logs"] === undefined) {
					throw new Error(
						"--collect-logs is required (or pass --body with this field set)."
					);
				}
				if (argv["rate-limiting-interval"] === undefined) {
					throw new Error(
						"--rate-limiting-interval is required (or pass --body with this field set)."
					);
				}
				if (argv["rate-limiting-limit"] === undefined) {
					throw new Error(
						"--rate-limiting-limit is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["authentication"] !== undefined)
					setNestedValue(bodyData, ["authentication"], argv["authentication"]);
				if (argv["byok-only"] !== undefined)
					setNestedValue(bodyData, ["byok_only"], argv["byok-only"]);
				if (argv["cache-invalidate-on-update"] !== undefined)
					setNestedValue(
						bodyData,
						["cache_invalidate_on_update"],
						argv["cache-invalidate-on-update"]
					);
				if (argv["cache-ttl"] !== undefined)
					setNestedValue(bodyData, ["cache_ttl"], argv["cache-ttl"]);
				if (argv["collect-logs"] !== undefined)
					setNestedValue(bodyData, ["collect_logs"], argv["collect-logs"]);
				if (argv["guardrails-prompt-p1"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "P1"],
						resolveFileToken(
							argv["guardrails-prompt-p1"] as string | undefined,
							"guardrails-prompt-p1",
							"text"
						)
					);
				if (argv["guardrails-prompt-s1"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S1"],
						resolveFileToken(
							argv["guardrails-prompt-s1"] as string | undefined,
							"guardrails-prompt-s1",
							"text"
						)
					);
				if (argv["guardrails-prompt-s10"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S10"],
						resolveFileToken(
							argv["guardrails-prompt-s10"] as string | undefined,
							"guardrails-prompt-s10",
							"text"
						)
					);
				if (argv["guardrails-prompt-s11"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S11"],
						resolveFileToken(
							argv["guardrails-prompt-s11"] as string | undefined,
							"guardrails-prompt-s11",
							"text"
						)
					);
				if (argv["guardrails-prompt-s12"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S12"],
						resolveFileToken(
							argv["guardrails-prompt-s12"] as string | undefined,
							"guardrails-prompt-s12",
							"text"
						)
					);
				if (argv["guardrails-prompt-s13"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S13"],
						resolveFileToken(
							argv["guardrails-prompt-s13"] as string | undefined,
							"guardrails-prompt-s13",
							"text"
						)
					);
				if (argv["guardrails-prompt-s2"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S2"],
						resolveFileToken(
							argv["guardrails-prompt-s2"] as string | undefined,
							"guardrails-prompt-s2",
							"text"
						)
					);
				if (argv["guardrails-prompt-s3"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S3"],
						resolveFileToken(
							argv["guardrails-prompt-s3"] as string | undefined,
							"guardrails-prompt-s3",
							"text"
						)
					);
				if (argv["guardrails-prompt-s4"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S4"],
						resolveFileToken(
							argv["guardrails-prompt-s4"] as string | undefined,
							"guardrails-prompt-s4",
							"text"
						)
					);
				if (argv["guardrails-prompt-s5"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S5"],
						resolveFileToken(
							argv["guardrails-prompt-s5"] as string | undefined,
							"guardrails-prompt-s5",
							"text"
						)
					);
				if (argv["guardrails-prompt-s6"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S6"],
						resolveFileToken(
							argv["guardrails-prompt-s6"] as string | undefined,
							"guardrails-prompt-s6",
							"text"
						)
					);
				if (argv["guardrails-prompt-s7"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S7"],
						resolveFileToken(
							argv["guardrails-prompt-s7"] as string | undefined,
							"guardrails-prompt-s7",
							"text"
						)
					);
				if (argv["guardrails-prompt-s8"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S8"],
						resolveFileToken(
							argv["guardrails-prompt-s8"] as string | undefined,
							"guardrails-prompt-s8",
							"text"
						)
					);
				if (argv["guardrails-prompt-s9"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "prompt", "S9"],
						resolveFileToken(
							argv["guardrails-prompt-s9"] as string | undefined,
							"guardrails-prompt-s9",
							"text"
						)
					);
				if (argv["guardrails-response-p1"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "P1"],
						resolveFileToken(
							argv["guardrails-response-p1"] as string | undefined,
							"guardrails-response-p1",
							"text"
						)
					);
				if (argv["guardrails-response-s1"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S1"],
						resolveFileToken(
							argv["guardrails-response-s1"] as string | undefined,
							"guardrails-response-s1",
							"text"
						)
					);
				if (argv["guardrails-response-s10"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S10"],
						resolveFileToken(
							argv["guardrails-response-s10"] as string | undefined,
							"guardrails-response-s10",
							"text"
						)
					);
				if (argv["guardrails-response-s11"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S11"],
						resolveFileToken(
							argv["guardrails-response-s11"] as string | undefined,
							"guardrails-response-s11",
							"text"
						)
					);
				if (argv["guardrails-response-s12"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S12"],
						resolveFileToken(
							argv["guardrails-response-s12"] as string | undefined,
							"guardrails-response-s12",
							"text"
						)
					);
				if (argv["guardrails-response-s13"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S13"],
						resolveFileToken(
							argv["guardrails-response-s13"] as string | undefined,
							"guardrails-response-s13",
							"text"
						)
					);
				if (argv["guardrails-response-s2"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S2"],
						resolveFileToken(
							argv["guardrails-response-s2"] as string | undefined,
							"guardrails-response-s2",
							"text"
						)
					);
				if (argv["guardrails-response-s3"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S3"],
						resolveFileToken(
							argv["guardrails-response-s3"] as string | undefined,
							"guardrails-response-s3",
							"text"
						)
					);
				if (argv["guardrails-response-s4"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S4"],
						resolveFileToken(
							argv["guardrails-response-s4"] as string | undefined,
							"guardrails-response-s4",
							"text"
						)
					);
				if (argv["guardrails-response-s5"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S5"],
						resolveFileToken(
							argv["guardrails-response-s5"] as string | undefined,
							"guardrails-response-s5",
							"text"
						)
					);
				if (argv["guardrails-response-s6"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S6"],
						resolveFileToken(
							argv["guardrails-response-s6"] as string | undefined,
							"guardrails-response-s6",
							"text"
						)
					);
				if (argv["guardrails-response-s7"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S7"],
						resolveFileToken(
							argv["guardrails-response-s7"] as string | undefined,
							"guardrails-response-s7",
							"text"
						)
					);
				if (argv["guardrails-response-s8"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S8"],
						resolveFileToken(
							argv["guardrails-response-s8"] as string | undefined,
							"guardrails-response-s8",
							"text"
						)
					);
				if (argv["guardrails-response-s9"] !== undefined)
					setNestedValue(
						bodyData,
						["guardrails", "response", "S9"],
						resolveFileToken(
							argv["guardrails-response-s9"] as string | undefined,
							"guardrails-response-s9",
							"text"
						)
					);
				if (argv["log-classification"] !== undefined)
					setNestedValue(
						bodyData,
						["log_classification"],
						argv["log-classification"]
					);
				if (argv["log-management"] !== undefined)
					setNestedValue(bodyData, ["log_management"], argv["log-management"]);
				if (argv["log-management-strategy"] !== undefined)
					setNestedValue(
						bodyData,
						["log_management_strategy"],
						resolveFileToken(
							argv["log-management-strategy"] as string | undefined,
							"log-management-strategy",
							"text"
						)
					);
				if (argv["logpush"] !== undefined)
					setNestedValue(bodyData, ["logpush"], argv["logpush"]);
				if (argv["logpush-public-key"] !== undefined)
					setNestedValue(
						bodyData,
						["logpush_public_key"],
						resolveFileToken(
							argv["logpush-public-key"] as string | undefined,
							"logpush-public-key",
							"text"
						)
					);
				if (argv["otel"] !== undefined)
					setNestedValue(
						bodyData,
						["otel"],
						parseObjectArray(argv["otel"], "otel")
					);
				if (argv["rate-limiting-interval"] !== undefined)
					setNestedValue(
						bodyData,
						["rate_limiting_interval"],
						argv["rate-limiting-interval"]
					);
				if (argv["rate-limiting-limit"] !== undefined)
					setNestedValue(
						bodyData,
						["rate_limiting_limit"],
						argv["rate-limiting-limit"]
					);
				if (argv["rate-limiting-technique"] !== undefined)
					setNestedValue(
						bodyData,
						["rate_limiting_technique"],
						resolveFileToken(
							argv["rate-limiting-technique"] as string | undefined,
							"rate-limiting-technique",
							"text"
						)
					);
				if (argv["retry-backoff"] !== undefined)
					setNestedValue(
						bodyData,
						["retry_backoff"],
						resolveFileToken(
							argv["retry-backoff"] as string | undefined,
							"retry-backoff",
							"text"
						)
					);
				if (argv["retry-delay"] !== undefined)
					setNestedValue(bodyData, ["retry_delay"], argv["retry-delay"]);
				if (argv["retry-max-attempts"] !== undefined)
					setNestedValue(
						bodyData,
						["retry_max_attempts"],
						argv["retry-max-attempts"]
					);
				if (argv["spend-limits-enabled"] !== undefined)
					setNestedValue(
						bodyData,
						["spend_limits", "enabled"],
						argv["spend-limits-enabled"]
					);
				if (argv["store-id"] !== undefined)
					setNestedValue(
						bodyData,
						["store_id"],
						resolveFileToken(
							argv["store-id"] as string | undefined,
							"store-id",
							"text"
						)
					);
				if (argv["stripe-authorization"] !== undefined)
					setNestedValue(
						bodyData,
						["stripe", "authorization"],
						resolveFileToken(
							argv["stripe-authorization"] as string | undefined,
							"stripe-authorization",
							"text"
						)
					);
				if (argv["workers-ai-billing-mode"] !== undefined)
					setNestedValue(
						bodyData,
						["workers_ai_billing_mode"],
						resolveFileToken(
							argv["workers-ai-billing-mode"] as string | undefined,
							"workers-ai-billing-mode",
							"text"
						)
					);
				if (argv["zdr"] !== undefined)
					setNestedValue(bodyData, ["zdr"], argv["zdr"]);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/ai-gateway/gateways/${encodeURIComponent(String(argv["gateway-id"]))}`,
						{ body: Object.keys(bodyData).length > 0 ? bodyData : undefined }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
