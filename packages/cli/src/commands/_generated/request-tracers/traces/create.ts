import operation from "../../_operations/request-tracers/traces/create.js";
/**
 * create command
 * @generated from apis/overlays/request-tracers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Request Trace",
	usage:
		"$0 request-tracers traces create\n\nTraces a simulated HTTP request through Cloudflare's edge to analyze how rules, settings, and configurations would process the request. Useful for debugging firewall rules, page rules, and other request transformations without sending actual traffic. Supports custom headers, cookies, body content, and geolocation context.",
	flags: {
		"body-base64": {
			kind: "parsed",
			brief: "Base64 encoded request body",
			optional: true,
			parse: String,
		},
		"body-json": {
			kind: "parsed",
			brief:
				'Arbitrary json as request body. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"body-plain-text": {
			kind: "parsed",
			brief: "Request body as plain text",
			optional: true,
			parse: String,
		},
		"context-bot-score": {
			kind: "parsed",
			brief: "Bot score used for evaluating tracing request processing",
			optional: true,
			parse: Number,
		},
		"context-geoloc-city": {
			kind: "parsed",
			brief: "The context.geoloc.city field",
			optional: true,
			parse: String,
		},
		"context-geoloc-continent": {
			kind: "parsed",
			brief: "The context.geoloc.continent field",
			optional: true,
			parse: String,
		},
		"context-geoloc-is-eu-country": {
			kind: "boolean",
			brief: "The context.geoloc.is_eu_country field",
			optional: true,
		},
		"context-geoloc-iso-code": {
			kind: "parsed",
			brief: "The context.geoloc.iso_code field",
			optional: true,
			parse: String,
		},
		"context-geoloc-latitude": {
			kind: "parsed",
			brief: "The context.geoloc.latitude field",
			optional: true,
			parse: Number,
		},
		"context-geoloc-longitude": {
			kind: "parsed",
			brief: "The context.geoloc.longitude field",
			optional: true,
			parse: Number,
		},
		"context-geoloc-postal-code": {
			kind: "parsed",
			brief: "The context.geoloc.postal_code field",
			optional: true,
			parse: String,
		},
		"context-geoloc-region-code": {
			kind: "parsed",
			brief: "The context.geoloc.region_code field",
			optional: true,
			parse: String,
		},
		"context-geoloc-subdivision-2-iso-code": {
			kind: "parsed",
			brief: "The context.geoloc.subdivision_2_iso_code field",
			optional: true,
			parse: String,
		},
		"context-geoloc-timezone": {
			kind: "parsed",
			brief: "The context.geoloc.timezone field",
			optional: true,
			parse: String,
		},
		"context-skip-challenge": {
			kind: "boolean",
			brief:
				"Whether to skip any challenges for tracing request (e.g.: captcha)",
			optional: true,
		},
		"context-threat-score": {
			kind: "parsed",
			brief: "Threat score used for evaluating tracing request processing",
			optional: true,
			parse: Number,
		},
		cookies: {
			kind: "parsed",
			brief:
				'Cookies added to tracing request. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		headers: {
			kind: "parsed",
			brief:
				'Headers added to tracing request. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		method: {
			kind: "parsed",
			brief: "HTTP Method of tracing request",
			optional: true,
			parse: String,
		},
		protocol: {
			kind: "parsed",
			brief: "HTTP Protocol of tracing request",
			optional: true,
			parse: String,
		},
		"skip-response": {
			kind: "boolean",
			brief:
				"Skip sending the request to the Origin server after all rules evaluation",
			optional: true,
		},
		url: {
			kind: "parsed",
			brief: "URL to which perform tracing request",
			optional: true,
			parse: String,
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
				command: "request-tracers traces create",
				classification: {
					safeFlags: [
						"context-geoloc-is-eu-country",
						"context-skip-challenge",
						"skip-response",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
								: compactBody(
										{
											body: {
												base64: resolveFileToken(
													argv["body-base64"] as string | undefined,
													"body-base64",
													"text"
												),
												json: parseJsonMap(argv["body-json"], "body-json"),
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
														argv["context-geoloc-iso-code"] as
															| string
															| undefined,
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
														argv["context-geoloc-timezone"] as
															| string
															| undefined,
														"context-geoloc-timezone",
														"text"
													),
												},
												skip_challenge: argv["context-skip-challenge"],
												threat_score: argv["context-threat-score"],
											},
											cookies: parseJsonMap(argv["cookies"], "cookies"),
											headers: parseJsonMap(argv["headers"], "headers"),
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
										},
										[["body", "json"], ["cookies"], ["headers"]]
									),
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
				const bodyData = compactBody(
					{
						body: {
							base64: resolveFileToken(
								argv["body-base64"] as string | undefined,
								"body-base64",
								"text"
							),
							json: parseJsonMap(argv["body-json"], "body-json"),
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
						cookies: parseJsonMap(argv["cookies"], "cookies"),
						headers: parseJsonMap(argv["headers"], "headers"),
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
					},
					[["body", "json"], ["cookies"], ["headers"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
