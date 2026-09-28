import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { Argv, CommandModule } from "yargs";

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
		.option("id", {
			type: "string",
			description: "Unique identifier of the AI Gateway within the account.",
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
		.option("store-id", { type: "string", description: "The store_id field" })
		.option("workers-ai-billing-mode", {
			type: "string",
			description:
				"Controls how Workers AI inference calls routed through this gateway are billed. 'postpaid' bills the account directly through Workers AI; 'unified' deducts credits via AI Gateway using neuron-based pricing and delegates billing to AI Gateway.",
			choices: ["postpaid", "unified"],
			default: "postpaid",
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
						"log-management-strategy",
						"logpush",
						"rate-limiting-technique",
						"retry-backoff",
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
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
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
										store_id: resolveFileToken(
											argv["store-id"] as string | undefined,
											"store-id",
											"text"
										),
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
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
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
					store_id: resolveFileToken(
						argv["store-id"] as string | undefined,
						"store-id",
						"text"
					),
					workers_ai_billing_mode: resolveFileToken(
						argv["workers-ai-billing-mode"] as string | undefined,
						"workers-ai-billing-mode",
						"text"
					),
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
