import operation from "../../_operations/ai-search/namespace/create.js";
/**
 * create command
 * @generated from apis/overlays/ai-search.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	mergeBodyPositionals,
	parseBody,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <namespace>",
	describe: "Create a namespace",
	usage:
		"$0 ai-search namespace create <namespace>\n\nCreate a namespace for organizing AI Search instances.",
	flags: {
		description: {
			kind: "parsed",
			brief: "Optional description for the namespace. Max 256 characters.",
			optional: true,
			parse: String,
		},
		"public-endpoint-params-authorized-hosts": {
			kind: "parsed",
			brief: "The public_endpoint_params.authorized_hosts field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"public-endpoint-params-chat-completions-endpoint-disabled": {
			kind: "boolean",
			brief: "Disable chat completions endpoint for this public endpoint.",
			optional: true,
		},
		"public-endpoint-params-custom-domains": {
			kind: "parsed",
			brief:
				"Custom domain hostnames that alias this public endpoint. GET and create responses return the current set; on update (PUT) this field is only echoed back when supplied in the request body, otherwise it is null (omit it to leave domains unchanged).",
			variadic: true,
			optional: true,
			parse: String,
		},
		"public-endpoint-params-default-domain-enabled": {
			kind: "boolean",
			brief:
				"When false, the instance is reachable only via a registered custom domain and the default <public_endpoint_id>.search.ai.cloudflare.com host returns 404. Requires at least one custom domain. Defaults to true. public_endpoint_params is replaced wholesale on update, so resend default_domain_enabled on every update to keep the default host off — omitting it resets to true.",
			optional: true,
		},
		"public-endpoint-params-enabled": {
			kind: "boolean",
			brief: "The public_endpoint_params.enabled field",
			optional: true,
		},
		"public-endpoint-params-instances-allowed": {
			kind: "parsed",
			brief:
				"Instance IDs exposed through the namespace public endpoint. Empty means nothing is searchable. Every ID must reference an existing instance in this namespace, and the list must stay within the account's multi-instance search limit.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"public-endpoint-params-mcp-description": {
			kind: "parsed",
			brief: "The public_endpoint_params.mcp.description field",
			optional: true,
			parse: String,
		},
		"public-endpoint-params-mcp-disabled": {
			kind: "boolean",
			brief: "Disable MCP endpoint for this public endpoint.",
			optional: true,
		},
		"public-endpoint-params-rate-limit-period-ms": {
			kind: "parsed",
			brief: "The public_endpoint_params.rate_limit.period_ms field",
			optional: true,
			parse: Number,
		},
		"public-endpoint-params-rate-limit-requests": {
			kind: "parsed",
			brief: "The public_endpoint_params.rate_limit.requests field",
			optional: true,
			parse: Number,
		},
		"public-endpoint-params-rate-limit-technique": {
			kind: "parsed",
			brief: "The public_endpoint_params.rate_limit.technique field",
			optional: true,
			choices: ["fixed", "sliding"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"public-endpoint-params-rate-limit-technique",
					"text"
				),
		},
		"public-endpoint-params-search-endpoint-disabled": {
			kind: "boolean",
			brief: "Disable search endpoint for this public endpoint.",
			optional: true,
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
	operands: [
		{
			placeholder: "namespace",
			brief: "Name for the new namespace.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search namespace create",
				classification: {
					safeFlags: [
						"public-endpoint-params-chat-completions-endpoint-disabled",
						"public-endpoint-params-default-domain-enabled",
						"public-endpoint-params-enabled",
						"public-endpoint-params-mcp-disabled",
						"public-endpoint-params-rate-limit-technique",
						"public-endpoint-params-search-endpoint-disabled",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search namespace create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? mergeBodyPositionals(parseBody(argv.body), [
										{
											name: "namespace",
											field: "name",
											value: argv["namespace"],
										},
									])
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										public_endpoint_params: {
											authorized_hosts:
												argv["public-endpoint-params-authorized-hosts"],
											chat_completions_endpoint: {
												disabled:
													argv[
														"public-endpoint-params-chat-completions-endpoint-disabled"
													],
											},
											custom_domains:
												argv["public-endpoint-params-custom-domains"],
											default_domain_enabled:
												argv["public-endpoint-params-default-domain-enabled"],
											enabled: argv["public-endpoint-params-enabled"],
											instances_allowed:
												argv["public-endpoint-params-instances-allowed"],
											mcp: {
												description: resolveFileToken(
													argv["public-endpoint-params-mcp-description"] as
														| string
														| undefined,
													"public-endpoint-params-mcp-description",
													"text"
												),
												disabled: argv["public-endpoint-params-mcp-disabled"],
											},
											rate_limit: {
												period_ms:
													argv["public-endpoint-params-rate-limit-period-ms"],
												requests:
													argv["public-endpoint-params-rate-limit-requests"],
												technique:
													argv["public-endpoint-params-rate-limit-technique"],
											},
											search_endpoint: {
												disabled:
													argv[
														"public-endpoint-params-search-endpoint-disabled"
													],
											},
										},
										name: argv["namespace"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined
						? mergeBodyPositionals(parseBody(argv.body), [
								{ name: "namespace", field: "name", value: argv["namespace"] },
							])
						: undefined;
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

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					public_endpoint_params: {
						authorized_hosts: argv["public-endpoint-params-authorized-hosts"],
						chat_completions_endpoint: {
							disabled:
								argv[
									"public-endpoint-params-chat-completions-endpoint-disabled"
								],
						},
						custom_domains: argv["public-endpoint-params-custom-domains"],
						default_domain_enabled:
							argv["public-endpoint-params-default-domain-enabled"],
						enabled: argv["public-endpoint-params-enabled"],
						instances_allowed: argv["public-endpoint-params-instances-allowed"],
						mcp: {
							description: resolveFileToken(
								argv["public-endpoint-params-mcp-description"] as
									| string
									| undefined,
								"public-endpoint-params-mcp-description",
								"text"
							),
							disabled: argv["public-endpoint-params-mcp-disabled"],
						},
						rate_limit: {
							period_ms: argv["public-endpoint-params-rate-limit-period-ms"],
							requests: argv["public-endpoint-params-rate-limit-requests"],
							technique: argv["public-endpoint-params-rate-limit-technique"],
						},
						search_endpoint: {
							disabled: argv["public-endpoint-params-search-endpoint-disabled"],
						},
					},
					name: argv["namespace"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
