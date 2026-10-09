import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-gateway gateways create\n\nCreates an AI Gateway in the account with the specified caching, rate limiting, logging, and authentication settings. The gateway ID appears in request URLs and must be unique within the account."
		)
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
		.coerce("guardrails-prompt-p1", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-p1", "text")
		)
		.option("guardrails-prompt-s1", {
			type: "string",
			description: "The guardrails.prompt.S1 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s1", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s1", "text")
		)
		.option("guardrails-prompt-s10", {
			type: "string",
			description: "The guardrails.prompt.S10 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s10", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s10", "text")
		)
		.option("guardrails-prompt-s11", {
			type: "string",
			description: "The guardrails.prompt.S11 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s11", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s11", "text")
		)
		.option("guardrails-prompt-s12", {
			type: "string",
			description: "The guardrails.prompt.S12 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s12", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s12", "text")
		)
		.option("guardrails-prompt-s13", {
			type: "string",
			description: "The guardrails.prompt.S13 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s13", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s13", "text")
		)
		.option("guardrails-prompt-s2", {
			type: "string",
			description: "The guardrails.prompt.S2 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s2", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s2", "text")
		)
		.option("guardrails-prompt-s3", {
			type: "string",
			description: "The guardrails.prompt.S3 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s3", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s3", "text")
		)
		.option("guardrails-prompt-s4", {
			type: "string",
			description: "The guardrails.prompt.S4 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s4", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s4", "text")
		)
		.option("guardrails-prompt-s5", {
			type: "string",
			description: "The guardrails.prompt.S5 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s5", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s5", "text")
		)
		.option("guardrails-prompt-s6", {
			type: "string",
			description: "The guardrails.prompt.S6 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s6", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s6", "text")
		)
		.option("guardrails-prompt-s7", {
			type: "string",
			description: "The guardrails.prompt.S7 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s7", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s7", "text")
		)
		.option("guardrails-prompt-s8", {
			type: "string",
			description: "The guardrails.prompt.S8 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s8", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s8", "text")
		)
		.option("guardrails-prompt-s9", {
			type: "string",
			description: "The guardrails.prompt.S9 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-prompt-s9", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-prompt-s9", "text")
		)
		.option("guardrails-response-p1", {
			type: "string",
			description: "The guardrails.response.P1 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-p1", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-p1", "text")
		)
		.option("guardrails-response-s1", {
			type: "string",
			description: "The guardrails.response.S1 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s1", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s1", "text")
		)
		.option("guardrails-response-s10", {
			type: "string",
			description: "The guardrails.response.S10 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s10", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s10", "text")
		)
		.option("guardrails-response-s11", {
			type: "string",
			description: "The guardrails.response.S11 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s11", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s11", "text")
		)
		.option("guardrails-response-s12", {
			type: "string",
			description: "The guardrails.response.S12 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s12", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s12", "text")
		)
		.option("guardrails-response-s13", {
			type: "string",
			description: "The guardrails.response.S13 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s13", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s13", "text")
		)
		.option("guardrails-response-s2", {
			type: "string",
			description: "The guardrails.response.S2 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s2", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s2", "text")
		)
		.option("guardrails-response-s3", {
			type: "string",
			description: "The guardrails.response.S3 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s3", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s3", "text")
		)
		.option("guardrails-response-s4", {
			type: "string",
			description: "The guardrails.response.S4 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s4", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s4", "text")
		)
		.option("guardrails-response-s5", {
			type: "string",
			description: "The guardrails.response.S5 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s5", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s5", "text")
		)
		.option("guardrails-response-s6", {
			type: "string",
			description: "The guardrails.response.S6 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s6", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s6", "text")
		)
		.option("guardrails-response-s7", {
			type: "string",
			description: "The guardrails.response.S7 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s7", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s7", "text")
		)
		.option("guardrails-response-s8", {
			type: "string",
			description: "The guardrails.response.S8 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s8", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s8", "text")
		)
		.option("guardrails-response-s9", {
			type: "string",
			description: "The guardrails.response.S9 field",
			choices: ["FLAG", "BLOCK"],
		})
		.coerce("guardrails-response-s9", (value: string | undefined) =>
			resolveFileToken(value, "guardrails-response-s9", "text")
		)
		.option("id", {
			type: "string",
			description: "Unique identifier of the AI Gateway within the account.",
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
		.coerce("log-management-strategy", (value: string | undefined) =>
			resolveFileToken(value, "log-management-strategy", "text")
		)
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
		.coerce("rate-limiting-technique", (value: string | undefined) =>
			resolveFileToken(value, "rate-limiting-technique", "text")
		)
		.option("retry-backoff", {
			type: "string",
			description: "Backoff strategy for retry delays",
			choices: ["constant", "linear", "exponential"],
		})
		.coerce("retry-backoff", (value: string | undefined) =>
			resolveFileToken(value, "retry-backoff", "text")
		)
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
			default: "postpaid",
		})
		.coerce("workers-ai-billing-mode", (value: string | undefined) =>
			resolveFileToken(value, "workers-ai-billing-mode", "text")
		)
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

type Request = SdkRequest<"aig-config-create-gateway">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a gateway",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway gateways create",
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
						command: "cf ai-gateway gateways create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways`,
						pathParams: {},
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
												P1: argv["guardrails-prompt-p1"],
												S1: argv["guardrails-prompt-s1"],
												S10: argv["guardrails-prompt-s10"],
												S11: argv["guardrails-prompt-s11"],
												S12: argv["guardrails-prompt-s12"],
												S13: argv["guardrails-prompt-s13"],
												S2: argv["guardrails-prompt-s2"],
												S3: argv["guardrails-prompt-s3"],
												S4: argv["guardrails-prompt-s4"],
												S5: argv["guardrails-prompt-s5"],
												S6: argv["guardrails-prompt-s6"],
												S7: argv["guardrails-prompt-s7"],
												S8: argv["guardrails-prompt-s8"],
												S9: argv["guardrails-prompt-s9"],
											},
											response: {
												P1: argv["guardrails-response-p1"],
												S1: argv["guardrails-response-s1"],
												S10: argv["guardrails-response-s10"],
												S11: argv["guardrails-response-s11"],
												S12: argv["guardrails-response-s12"],
												S13: argv["guardrails-response-s13"],
												S2: argv["guardrails-response-s2"],
												S3: argv["guardrails-response-s3"],
												S4: argv["guardrails-response-s4"],
												S5: argv["guardrails-response-s5"],
												S6: argv["guardrails-response-s6"],
												S7: argv["guardrails-response-s7"],
												S8: argv["guardrails-response-s8"],
												S9: argv["guardrails-response-s9"],
											},
										},
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
										log_classification: argv["log-classification"],
										log_management: argv["log-management"],
										log_management_strategy: argv["log-management-strategy"],
										logpush: argv["logpush"],
										logpush_public_key: resolveFileToken(
											argv["logpush-public-key"] as string | undefined,
											"logpush-public-key",
											"text"
										),
										otel: parseObjectArray(argv["otel"], "otel"),
										rate_limiting_interval: argv["rate-limiting-interval"],
										rate_limiting_limit: argv["rate-limiting-limit"],
										rate_limiting_technique: argv["rate-limiting-technique"],
										retry_backoff: argv["retry-backoff"],
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
										workers_ai_billing_mode: argv["workers-ai-billing-mode"],
										zdr: argv["zdr"],
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
						client.aiGateway.gateways.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
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
				if (argv["id"] === undefined) {
					argv["id"] = await promptForRequiredField(
						"id",
						"Unique identifier of the AI Gateway within the account."
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
				const bodyData = compactBody<Body>({
					authentication: argv["authentication"],
					byok_only: argv["byok-only"],
					cache_invalidate_on_update: argv["cache-invalidate-on-update"],
					cache_ttl: argv["cache-ttl"],
					collect_logs: argv["collect-logs"],
					guardrails: {
						prompt: {
							P1: argv["guardrails-prompt-p1"],
							S1: argv["guardrails-prompt-s1"],
							S10: argv["guardrails-prompt-s10"],
							S11: argv["guardrails-prompt-s11"],
							S12: argv["guardrails-prompt-s12"],
							S13: argv["guardrails-prompt-s13"],
							S2: argv["guardrails-prompt-s2"],
							S3: argv["guardrails-prompt-s3"],
							S4: argv["guardrails-prompt-s4"],
							S5: argv["guardrails-prompt-s5"],
							S6: argv["guardrails-prompt-s6"],
							S7: argv["guardrails-prompt-s7"],
							S8: argv["guardrails-prompt-s8"],
							S9: argv["guardrails-prompt-s9"],
						},
						response: {
							P1: argv["guardrails-response-p1"],
							S1: argv["guardrails-response-s1"],
							S10: argv["guardrails-response-s10"],
							S11: argv["guardrails-response-s11"],
							S12: argv["guardrails-response-s12"],
							S13: argv["guardrails-response-s13"],
							S2: argv["guardrails-response-s2"],
							S3: argv["guardrails-response-s3"],
							S4: argv["guardrails-response-s4"],
							S5: argv["guardrails-response-s5"],
							S6: argv["guardrails-response-s6"],
							S7: argv["guardrails-response-s7"],
							S8: argv["guardrails-response-s8"],
							S9: argv["guardrails-response-s9"],
						},
					},
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					log_classification: argv["log-classification"],
					log_management: argv["log-management"],
					log_management_strategy: argv["log-management-strategy"],
					logpush: argv["logpush"],
					logpush_public_key: resolveFileToken(
						argv["logpush-public-key"] as string | undefined,
						"logpush-public-key",
						"text"
					),
					otel: parseObjectArray(argv["otel"], "otel"),
					rate_limiting_interval: argv["rate-limiting-interval"],
					rate_limiting_limit: argv["rate-limiting-limit"],
					rate_limiting_technique: argv["rate-limiting-technique"],
					retry_backoff: argv["retry-backoff"],
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
					workers_ai_billing_mode: argv["workers-ai-billing-mode"],
					zdr: argv["zdr"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.aiGateway.gateways.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
