import operation from "../../_operations/request-tracers/traces/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
	);
}
