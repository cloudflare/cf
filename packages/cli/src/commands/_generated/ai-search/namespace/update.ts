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
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/ai-search.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-search namespace update <name>\n\nUpdate the description and/or the public endpoint configuration of an existing namespace. The default namespace's description cannot be modified, but its public endpoint can."
		)
		.positional("name", {
			type: "string",
			description: "Namespace to update.",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description:
				"Optional description for the namespace. Max 256 characters.",
		})
		.option("public-endpoint-params-authorized-hosts", {
			type: "string",
			array: true,
			description: "The public_endpoint_params.authorized_hosts field",
		})
		.option("public-endpoint-params-chat-completions-endpoint-disabled", {
			type: "boolean",
			description: "Disable chat completions endpoint for this public endpoint",
		})
		.option("public-endpoint-params-custom-domains", {
			type: "string",
			array: true,
			description:
				"Custom domain hostnames that alias this public endpoint. GET and create responses return the current set; on update (PUT) this field is only echoed back when supplied in the request body, otherwise it is null (omit it to leave domains unchanged).",
		})
		.option("public-endpoint-params-default-domain-enabled", {
			type: "boolean",
			description:
				"When false, the instance is reachable only via a registered custom domain and the default <public_endpoint_id>.search.ai.cloudflare.com host returns 404. Requires at least one custom domain. Defaults to true. public_endpoint_params is replaced wholesale on update, so resend default_domain_enabled on every update to keep the default host off — omitting it resets to true.",
		})
		.option("public-endpoint-params-enabled", {
			type: "boolean",
			description: "The public_endpoint_params.enabled field",
		})
		.option("public-endpoint-params-instances-allowed", {
			type: "string",
			array: true,
			description:
				"Instance IDs exposed through the namespace public endpoint. Empty means nothing is searchable. Every ID must be an existing instance in this namespace, and the list cannot exceed the account's multi-instance search limit.",
		})
		.option("public-endpoint-params-mcp-description", {
			type: "string",
			description: "The public_endpoint_params.mcp.description field",
		})
		.option("public-endpoint-params-mcp-disabled", {
			type: "boolean",
			description: "Disable MCP endpoint for this public endpoint",
		})
		.option("public-endpoint-params-rate-limit-period-ms", {
			type: "number",
			description: "The public_endpoint_params.rate_limit.period_ms field",
		})
		.option("public-endpoint-params-rate-limit-requests", {
			type: "number",
			description: "The public_endpoint_params.rate_limit.requests field",
		})
		.option("public-endpoint-params-rate-limit-technique", {
			type: "string",
			description: "The public_endpoint_params.rate_limit.technique field",
			choices: ["fixed", "sliding"],
		})
		.option("public-endpoint-params-search-endpoint-disabled", {
			type: "boolean",
			description: "Disable search endpoint for this public endpoint",
		})
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

type Request = SdkRequest<"ai-search-update-namespace">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <name>",
	describe: "Update a namespace",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search namespace update",
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search namespace update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}`,
						pathParams: { name: String(argv["name"] ?? "") },
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
												technique: resolveFileToken(
													argv["public-endpoint-params-rate-limit-technique"] as
														| string
														| undefined,
													"public-endpoint-params-rate-limit-technique",
													"text"
												),
											},
											search_endpoint: {
												disabled:
													argv[
														"public-endpoint-params-search-endpoint-disabled"
													],
											},
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.aiSearch.namespace.update({
							...bodyData,
							account_id: accountId,
							name: argv["name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
							technique: resolveFileToken(
								argv["public-endpoint-params-rate-limit-technique"] as
									| string
									| undefined,
								"public-endpoint-params-rate-limit-technique",
								"text"
							),
						},
						search_endpoint: {
							disabled: argv["public-endpoint-params-search-endpoint-disabled"],
						},
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.aiSearch.namespace.update({
						...bodyData,
						account_id: accountId,
						name: argv["name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
