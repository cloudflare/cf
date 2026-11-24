import operation from "../../_operations/ai-gateway/gateways/create.js";
/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a gateway",
	usage:
		"$0 ai-gateway gateways create\n\nCreates an AI Gateway in the account with the specified caching, rate limiting, logging, and authentication settings. The gateway ID appears in request URLs and must be unique within the account.",
	flags: {
		authentication: {
			kind: "boolean",
			brief:
				"Require authentication for gateway access. New gateways must have authentication enabled. Once enabled, authentication cannot be disabled.",
			optional: true,
		},
		"byok-only": {
			kind: "boolean",
			brief:
				"Requires customer-provided provider credentials and prevents fallback to Unified Billing.",
			optional: true,
		},
		"cache-invalidate-on-update": {
			kind: "boolean",
			brief: "The cache_invalidate_on_update field",
			optional: true,
		},
		"cache-ttl": {
			kind: "parsed",
			brief: "The cache_ttl field",
			optional: true,
			parse: Number,
		},
		"collect-logs": {
			kind: "boolean",
			brief: "The collect_logs field",
			optional: true,
		},
		"guardrails-prompt-p1": {
			kind: "parsed",
			brief: "The guardrails.prompt.P1 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-p1", "text"),
		},
		"guardrails-prompt-s1": {
			kind: "parsed",
			brief: "The guardrails.prompt.S1 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s1", "text"),
		},
		"guardrails-prompt-s10": {
			kind: "parsed",
			brief: "The guardrails.prompt.S10 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s10", "text"),
		},
		"guardrails-prompt-s11": {
			kind: "parsed",
			brief: "The guardrails.prompt.S11 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s11", "text"),
		},
		"guardrails-prompt-s12": {
			kind: "parsed",
			brief: "The guardrails.prompt.S12 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s12", "text"),
		},
		"guardrails-prompt-s13": {
			kind: "parsed",
			brief: "The guardrails.prompt.S13 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s13", "text"),
		},
		"guardrails-prompt-s14": {
			kind: "parsed",
			brief: "The guardrails.prompt.S14 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s14", "text"),
		},
		"guardrails-prompt-s2": {
			kind: "parsed",
			brief: "The guardrails.prompt.S2 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s2", "text"),
		},
		"guardrails-prompt-s3": {
			kind: "parsed",
			brief: "The guardrails.prompt.S3 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s3", "text"),
		},
		"guardrails-prompt-s4": {
			kind: "parsed",
			brief: "The guardrails.prompt.S4 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s4", "text"),
		},
		"guardrails-prompt-s5": {
			kind: "parsed",
			brief: "The guardrails.prompt.S5 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s5", "text"),
		},
		"guardrails-prompt-s6": {
			kind: "parsed",
			brief: "The guardrails.prompt.S6 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s6", "text"),
		},
		"guardrails-prompt-s7": {
			kind: "parsed",
			brief: "The guardrails.prompt.S7 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s7", "text"),
		},
		"guardrails-prompt-s8": {
			kind: "parsed",
			brief: "The guardrails.prompt.S8 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s8", "text"),
		},
		"guardrails-prompt-s9": {
			kind: "parsed",
			brief: "The guardrails.prompt.S9 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-prompt-s9", "text"),
		},
		"guardrails-response-p1": {
			kind: "parsed",
			brief: "The guardrails.response.P1 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-p1", "text"),
		},
		"guardrails-response-s1": {
			kind: "parsed",
			brief: "The guardrails.response.S1 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s1", "text"),
		},
		"guardrails-response-s10": {
			kind: "parsed",
			brief: "The guardrails.response.S10 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s10", "text"),
		},
		"guardrails-response-s11": {
			kind: "parsed",
			brief: "The guardrails.response.S11 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s11", "text"),
		},
		"guardrails-response-s12": {
			kind: "parsed",
			brief: "The guardrails.response.S12 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s12", "text"),
		},
		"guardrails-response-s13": {
			kind: "parsed",
			brief: "The guardrails.response.S13 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s13", "text"),
		},
		"guardrails-response-s14": {
			kind: "parsed",
			brief: "The guardrails.response.S14 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s14", "text"),
		},
		"guardrails-response-s2": {
			kind: "parsed",
			brief: "The guardrails.response.S2 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s2", "text"),
		},
		"guardrails-response-s3": {
			kind: "parsed",
			brief: "The guardrails.response.S3 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s3", "text"),
		},
		"guardrails-response-s4": {
			kind: "parsed",
			brief: "The guardrails.response.S4 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s4", "text"),
		},
		"guardrails-response-s5": {
			kind: "parsed",
			brief: "The guardrails.response.S5 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s5", "text"),
		},
		"guardrails-response-s6": {
			kind: "parsed",
			brief: "The guardrails.response.S6 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s6", "text"),
		},
		"guardrails-response-s7": {
			kind: "parsed",
			brief: "The guardrails.response.S7 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s7", "text"),
		},
		"guardrails-response-s8": {
			kind: "parsed",
			brief: "The guardrails.response.S8 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s8", "text"),
		},
		"guardrails-response-s9": {
			kind: "parsed",
			brief: "The guardrails.response.S9 field",
			optional: true,
			choices: ["FLAG", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-response-s9", "text"),
		},
		id: {
			kind: "parsed",
			brief: "Unique identifier of the AI Gateway within the account.",
			optional: true,
			parse: String,
		},
		"log-classification": {
			kind: "boolean",
			brief: "The log_classification field",
			optional: true,
		},
		"log-management": {
			kind: "parsed",
			brief: "The log_management field",
			optional: true,
			parse: Number,
		},
		"log-management-strategy": {
			kind: "parsed",
			brief: "The log_management_strategy field",
			optional: true,
			choices: ["STOP_INSERTING", "DELETE_OLDEST"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "log-management-strategy", "text"),
		},
		logpush: { kind: "boolean", brief: "The logpush field", optional: true },
		"logpush-public-key": {
			kind: "parsed",
			brief: "The logpush_public_key field",
			optional: true,
			parse: String,
		},
		"multiprovider-enabled": {
			kind: "boolean",
			brief:
				"Lets requests to a model use every provider that serves it. When off, a model uses only the providers it launched with, so a provider added later receives none of its traffic. A request that names providers (the cf-aig-allowed-providers header or routing.allowedProviders) can still use any of them. Model aliases (custom/) are not restricted.",
			optional: true,
		},
		otel: {
			kind: "parsed",
			brief:
				'The otel field. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"headers": {...}, "url": string, "authorization"?: string, "content_type"?: "json" | "protobuf"}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"rate-limiting-interval": {
			kind: "parsed",
			brief: "The rate_limiting_interval field",
			optional: true,
			parse: Number,
		},
		"rate-limiting-limit": {
			kind: "parsed",
			brief: "The rate_limiting_limit field",
			optional: true,
			parse: Number,
		},
		"rate-limiting-technique": {
			kind: "parsed",
			brief: "The rate_limiting_technique field",
			optional: true,
			choices: ["fixed", "sliding"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "rate-limiting-technique", "text"),
		},
		"retry-backoff": {
			kind: "parsed",
			brief: "Backoff strategy for retry delays",
			optional: true,
			choices: ["constant", "linear", "exponential"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "retry-backoff", "text"),
		},
		"retry-delay": {
			kind: "parsed",
			brief: "Delay between retry attempts in milliseconds (0-60000)",
			optional: true,
			parse: Number,
		},
		"retry-max-attempts": {
			kind: "parsed",
			brief: "Maximum number of retry attempts for failed requests (1-5)",
			optional: true,
			parse: Number,
		},
		"spend-limits-enabled": {
			kind: "boolean",
			brief: "The spend_limits.enabled field",
			optional: true,
		},
		"spend-limits-rules": {
			kind: "parsed",
			brief:
				'The spend_limits.rules field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"limit": number, "limitType": "cost", "window": number, "enabled"?: boolean, "id"?: string, ...more}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"store-id": {
			kind: "parsed",
			brief:
				"Secrets Store used by this gateway. Omit on update to keep the current store. Cannot be cleared while stored keys or secret references depend on it.",
			optional: true,
			parse: String,
		},
		"stripe-authorization": {
			kind: "parsed",
			brief: "The stripe.authorization field",
			optional: true,
			parse: String,
		},
		"stripe-usage-events": {
			kind: "parsed",
			brief:
				'The stripe.usage_events field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"payload": string}].',
			optional: true,
			parse: String,
		},
		"workers-ai-billing-mode": {
			kind: "parsed",
			brief:
				"Controls how Workers AI inference calls routed through this gateway are billed. 'postpaid' bills the account directly through Workers AI; 'unified' deducts credits via AI Gateway using neuron-based pricing and delegates billing to AI Gateway.",
			default: "postpaid",
			choices: ["postpaid", "unified"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "workers-ai-billing-mode", "text"),
		},
		zdr: { kind: "boolean", brief: "The zdr field", optional: true },
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
	rules(rules) {
		rules.check((argv) => {
			const groupSet = ["stripe-authorization", "stripe-usage-events"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["stripe-authorization", "stripe-usage-events"].filter(
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
	},
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
						"guardrails-prompt-s14",
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
						"guardrails-response-s14",
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
						"multiprovider-enabled",
						"rate-limiting-technique",
						"retry-backoff",
						"spend-limits-enabled",
						"workers-ai-billing-mode",
						"zdr",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
												S14: argv["guardrails-prompt-s14"],
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
												S14: argv["guardrails-response-s14"],
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
										multiprovider_enabled: argv["multiprovider-enabled"],
										otel: parseObjectArray(argv["otel"], "otel", true),
										rate_limiting_interval: argv["rate-limiting-interval"],
										rate_limiting_limit: argv["rate-limiting-limit"],
										rate_limiting_technique: argv["rate-limiting-technique"],
										retry_backoff: argv["retry-backoff"],
										retry_delay: argv["retry-delay"],
										retry_max_attempts: argv["retry-max-attempts"],
										spend_limits: {
											enabled: argv["spend-limits-enabled"],
											rules: parseObjectArray(
												argv["spend-limits-rules"],
												"spend-limits-rules"
											),
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
											usage_events: parseObjectArray(
												argv["stripe-usage-events"],
												"stripe-usage-events"
											),
										},
										workers_ai_billing_mode: argv["workers-ai-billing-mode"],
										zdr: argv["zdr"],
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
							S14: argv["guardrails-prompt-s14"],
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
							S14: argv["guardrails-response-s14"],
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
					multiprovider_enabled: argv["multiprovider-enabled"],
					otel: parseObjectArray(argv["otel"], "otel", true),
					rate_limiting_interval: argv["rate-limiting-interval"],
					rate_limiting_limit: argv["rate-limiting-limit"],
					rate_limiting_technique: argv["rate-limiting-technique"],
					retry_backoff: argv["retry-backoff"],
					retry_delay: argv["retry-delay"],
					retry_max_attempts: argv["retry-max-attempts"],
					spend_limits: {
						enabled: argv["spend-limits-enabled"],
						rules: parseObjectArray(
							argv["spend-limits-rules"],
							"spend-limits-rules"
						),
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
						usage_events: parseObjectArray(
							argv["stripe-usage-events"],
							"stripe-usage-events"
						),
					},
					workers_ai_billing_mode: argv["workers-ai-billing-mode"],
					zdr: argv["zdr"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
