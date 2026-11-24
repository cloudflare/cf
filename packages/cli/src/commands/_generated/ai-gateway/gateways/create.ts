/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a gateway",
	usage:
		"$0 ai-gateway gateways create\n\nCreates an AI Gateway in the account with the specified caching, rate limiting, logging, and authentication settings. The gateway ID appears in request URLs and must be unique within the account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
