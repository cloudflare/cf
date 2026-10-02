import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/request-tracers.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 request-tracers traces create\n\nTraces a simulated HTTP request through Cloudflare's edge to analyze how rules, settings, and configurations would process the request. Useful for debugging firewall rules, page rules, and other request transformations without sending actual traffic. Supports custom headers, cookies, body content, and geolocation context."
		)
		.option("body-base64", {
			type: "string",
			description: "Base64 encoded request body",
		})
		.option("body-plain-text", {
			type: "string",
			description: "Request body as plain text",
		})
		.option("context-bot-score", {
			type: "number",
			description: "Bot score used for evaluating tracing request processing",
		})
		.option("context-geoloc-city", {
			type: "string",
			description: "The context.geoloc.city field",
		})
		.option("context-geoloc-continent", {
			type: "string",
			description: "The context.geoloc.continent field",
		})
		.option("context-geoloc-is-eu-country", {
			type: "boolean",
			description: "The context.geoloc.is_eu_country field",
		})
		.option("context-geoloc-iso-code", {
			type: "string",
			description: "The context.geoloc.iso_code field",
		})
		.option("context-geoloc-latitude", {
			type: "number",
			description: "The context.geoloc.latitude field",
		})
		.option("context-geoloc-longitude", {
			type: "number",
			description: "The context.geoloc.longitude field",
		})
		.option("context-geoloc-postal-code", {
			type: "string",
			description: "The context.geoloc.postal_code field",
		})
		.option("context-geoloc-region-code", {
			type: "string",
			description: "The context.geoloc.region_code field",
		})
		.option("context-geoloc-subdivision-2-iso-code", {
			type: "string",
			description: "The context.geoloc.subdivision_2_iso_code field",
		})
		.option("context-geoloc-timezone", {
			type: "string",
			description: "The context.geoloc.timezone field",
		})
		.option("context-skip-challenge", {
			type: "boolean",
			description:
				"Whether to skip any challenges for tracing request (e.g.: captcha)",
		})
		.option("context-threat-score", {
			type: "number",
			description:
				"Threat score used for evaluating tracing request processing",
		})
		.option("method", {
			type: "string",
			description: "HTTP Method of tracing request",
		})
		.option("protocol", {
			type: "string",
			description: "HTTP Protocol of tracing request",
		})
		.option("skip-response", {
			type: "boolean",
			description:
				"Skip sending the request to the Origin server after all rules evaluation",
		})
		.option("url", {
			type: "string",
			description: "URL to which perform tracing request",
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

type Request = SdkRequest<"account-request-tracer-request-trace">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Request Trace",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "request-tracers traces create",
				classification: {
					safeFlags: [
						"context-geoloc-is-eu-country",
						"context-skip-challenge",
						"skip-response",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf request-tracers traces create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/request-tracer/trace`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										body: {
											base64: resolveFileToken(
												argv["body-base64"] as string | undefined,
												"body-base64",
												"text"
											),
											plain_text: resolveFileToken(
												argv["body-plain-text"] as string | undefined,
												"body-plain-text",
												"text"
											),
										},
										context: {
											bot_score: argv["context-bot-score"],
											geoloc: {
												city: resolveFileToken(
													argv["context-geoloc-city"] as string | undefined,
													"context-geoloc-city",
													"text"
												),
												continent: resolveFileToken(
													argv["context-geoloc-continent"] as
														| string
														| undefined,
													"context-geoloc-continent",
													"text"
												),
												is_eu_country: argv["context-geoloc-is-eu-country"],
												iso_code: resolveFileToken(
													argv["context-geoloc-iso-code"] as string | undefined,
													"context-geoloc-iso-code",
													"text"
												),
												latitude: argv["context-geoloc-latitude"],
												longitude: argv["context-geoloc-longitude"],
												postal_code: resolveFileToken(
													argv["context-geoloc-postal-code"] as
														| string
														| undefined,
													"context-geoloc-postal-code",
													"text"
												),
												region_code: resolveFileToken(
													argv["context-geoloc-region-code"] as
														| string
														| undefined,
													"context-geoloc-region-code",
													"text"
												),
												subdivision_2_iso_code: resolveFileToken(
													argv["context-geoloc-subdivision-2-iso-code"] as
														| string
														| undefined,
													"context-geoloc-subdivision-2-iso-code",
													"text"
												),
												timezone: resolveFileToken(
													argv["context-geoloc-timezone"] as string | undefined,
													"context-geoloc-timezone",
													"text"
												),
											},
											skip_challenge: argv["context-skip-challenge"],
											threat_score: argv["context-threat-score"],
										},
										method: resolveFileToken(
											argv["method"] as string | undefined,
											"method",
											"text"
										),
										protocol: resolveFileToken(
											argv["protocol"] as string | undefined,
											"protocol",
											"text"
										),
										skip_response: argv["skip-response"],
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
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
						client.requestTracers.traces.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["method"] === undefined) {
					argv["method"] = await promptForRequiredField(
						"method",
						"HTTP Method of tracing request"
					);
				}
				if (argv["url"] === undefined) {
					argv["url"] = await promptForRequiredField(
						"url",
						"URL to which perform tracing request"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					body: {
						base64: resolveFileToken(
							argv["body-base64"] as string | undefined,
							"body-base64",
							"text"
						),
						plain_text: resolveFileToken(
							argv["body-plain-text"] as string | undefined,
							"body-plain-text",
							"text"
						),
					},
					context: {
						bot_score: argv["context-bot-score"],
						geoloc: {
							city: resolveFileToken(
								argv["context-geoloc-city"] as string | undefined,
								"context-geoloc-city",
								"text"
							),
							continent: resolveFileToken(
								argv["context-geoloc-continent"] as string | undefined,
								"context-geoloc-continent",
								"text"
							),
							is_eu_country: argv["context-geoloc-is-eu-country"],
							iso_code: resolveFileToken(
								argv["context-geoloc-iso-code"] as string | undefined,
								"context-geoloc-iso-code",
								"text"
							),
							latitude: argv["context-geoloc-latitude"],
							longitude: argv["context-geoloc-longitude"],
							postal_code: resolveFileToken(
								argv["context-geoloc-postal-code"] as string | undefined,
								"context-geoloc-postal-code",
								"text"
							),
							region_code: resolveFileToken(
								argv["context-geoloc-region-code"] as string | undefined,
								"context-geoloc-region-code",
								"text"
							),
							subdivision_2_iso_code: resolveFileToken(
								argv["context-geoloc-subdivision-2-iso-code"] as
									| string
									| undefined,
								"context-geoloc-subdivision-2-iso-code",
								"text"
							),
							timezone: resolveFileToken(
								argv["context-geoloc-timezone"] as string | undefined,
								"context-geoloc-timezone",
								"text"
							),
						},
						skip_challenge: argv["context-skip-challenge"],
						threat_score: argv["context-threat-score"],
					},
					method: resolveFileToken(
						argv["method"] as string | undefined,
						"method",
						"text"
					),
					protocol: resolveFileToken(
						argv["protocol"] as string | undefined,
						"protocol",
						"text"
					),
					skip_response: argv["skip-response"],
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.requestTracers.traces.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
