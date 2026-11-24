import operation from "../../_operations/smart-shield/health-checks/update.js";
/**
 * update command
 * @generated from apis/overlays/smart-shield.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <healthcheck-id>",
	describe: "Update Health Check",
	usage:
		"$0 smart-shield health-checks update <healthcheck-id>\n\nUpdate a configured health check.",
	flags: {
		errors: {
			kind: "parsed",
			brief:
				'The errors field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"code": number, "message": string}].',
			optional: true,
			parse: String,
		},
		messages: {
			kind: "parsed",
			brief:
				'The messages field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"code": number, "message": string}].',
			optional: true,
			parse: String,
		},
		"result-address": {
			kind: "parsed",
			brief:
				"The hostname or IP address of the origin server to run health checks on.",
			optional: true,
			parse: String,
		},
		"result-check-regions": {
			kind: "parsed",
			brief:
				"A list of regions from which to run health checks. Null means Cloudflare will pick a default region.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"result-consecutive-fails": {
			kind: "parsed",
			brief:
				"The number of consecutive fails required from a health check before changing the health to unhealthy.",
			optional: true,
			parse: Number,
		},
		"result-consecutive-successes": {
			kind: "parsed",
			brief:
				"The number of consecutive successes required from a health check before changing the health to healthy.",
			optional: true,
			parse: Number,
		},
		"result-description": {
			kind: "parsed",
			brief: "A human-readable description of the health check.",
			optional: true,
			parse: String,
		},
		"result-http-config-allow-insecure": {
			kind: "boolean",
			brief:
				"Do not validate the certificate when the health check uses HTTPS.",
			optional: true,
		},
		"result-http-config-expected-body": {
			kind: "parsed",
			brief:
				"A case-insensitive sub-string to look for in the response body. If this string is not found, the origin will be marked as unhealthy.",
			optional: true,
			parse: String,
		},
		"result-http-config-expected-codes": {
			kind: "parsed",
			brief:
				'The expected HTTP response codes (e.g. "200") or code ranges (e.g. "2xx" for all codes starting with 2) of the health check.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"result-http-config-follow-redirects": {
			kind: "boolean",
			brief: "Follow redirects if the origin returns a 3xx status code.",
			optional: true,
		},
		"result-http-config-header": {
			kind: "parsed",
			brief:
				'The HTTP request headers to send in the health check. It is recommended you set a Host header by default. The User-Agent header cannot be overridden. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [string]}.',
			optional: true,
			parse: String,
		},
		"result-http-config-method": {
			kind: "parsed",
			brief: "The HTTP method to use for the health check.",
			optional: true,
			choices: ["GET", "HEAD"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "result-http-config-method", "text"),
		},
		"result-http-config-path": {
			kind: "parsed",
			brief: "The endpoint path to health check against.",
			optional: true,
			parse: String,
		},
		"result-http-config-port": {
			kind: "parsed",
			brief:
				"Port number to connect to for the health check. Defaults to 80 if type is HTTP or 443 if type is HTTPS.",
			optional: true,
			parse: Number,
		},
		"result-interval": {
			kind: "parsed",
			brief:
				"The interval between each health check. Shorter intervals may give quicker notifications if the origin status changes, but will increase load on the origin as we check from multiple locations.",
			optional: true,
			parse: Number,
		},
		"result-name": {
			kind: "parsed",
			brief:
				"A short name to identify the health check. Only alphanumeric characters, hyphens and underscores are allowed.",
			optional: true,
			parse: String,
		},
		"result-retries": {
			kind: "parsed",
			brief:
				"The number of retries to attempt in case of a timeout before marking the origin as unhealthy. Retries are attempted immediately.",
			optional: true,
			parse: Number,
		},
		"result-suspended": {
			kind: "boolean",
			brief: "If suspended, no health checks are sent to the origin.",
			optional: true,
		},
		"result-tcp-config-method": {
			kind: "parsed",
			brief: "The TCP connection method to use for the health check.",
			optional: true,
			choices: ["connection_established"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "result-tcp-config-method", "text"),
		},
		"result-tcp-config-port": {
			kind: "parsed",
			brief: "Port number to connect to for the health check. Defaults to 80.",
			optional: true,
			parse: Number,
		},
		"result-timeout": {
			kind: "parsed",
			brief:
				"The timeout (in seconds) before marking the health check as failed.",
			optional: true,
			parse: Number,
		},
		"result-type": {
			kind: "parsed",
			brief:
				"The protocol to use for the health check. Currently supported protocols are 'HTTP', 'HTTPS' and 'TCP'.",
			optional: true,
			parse: String,
		},
		success: {
			kind: "boolean",
			brief: "Whether the API call was successful.",
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
		{ placeholder: "healthcheck-id", brief: "Identifier.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "smart-shield health-checks update",
				classification: {
					safeFlags: [
						"result-http-config-allow-insecure",
						"result-http-config-follow-redirects",
						"result-http-config-method",
						"result-suspended",
						"result-tcp-config-method",
						"success",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["errors"] === undefined) {
						throw new Error(
							"--errors is required (or pass --body with this field set)."
						);
					}
					if (argv["messages"] === undefined) {
						throw new Error(
							"--messages is required (or pass --body with this field set)."
						);
					}
					if (argv["success"] === undefined) {
						throw new Error(
							"--success is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf smart-shield health-checks update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/smart_shield/healthchecks/${argv["healthcheck-id"] == null ? "<healthcheck-id>" : encodeURIComponent(String(argv["healthcheck-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"healthcheck-id": String(argv["healthcheck-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											errors: parseObjectArray(argv["errors"], "errors"),
											messages: parseObjectArray(argv["messages"], "messages"),
											result: {
												address: resolveFileToken(
													argv["result-address"] as string | undefined,
													"result-address",
													"text"
												),
												check_regions: argv["result-check-regions"],
												consecutive_fails: argv["result-consecutive-fails"],
												consecutive_successes:
													argv["result-consecutive-successes"],
												description: resolveFileToken(
													argv["result-description"] as string | undefined,
													"result-description",
													"text"
												),
												http_config: {
													allow_insecure:
														argv["result-http-config-allow-insecure"],
													expected_body: resolveFileToken(
														argv["result-http-config-expected-body"] as
															| string
															| undefined,
														"result-http-config-expected-body",
														"text"
													),
													expected_codes:
														argv["result-http-config-expected-codes"],
													follow_redirects:
														argv["result-http-config-follow-redirects"],
													header: parseJsonMap(
														argv["result-http-config-header"],
														"result-http-config-header"
													),
													method: argv["result-http-config-method"],
													path: resolveFileToken(
														argv["result-http-config-path"] as
															| string
															| undefined,
														"result-http-config-path",
														"text"
													),
													port: argv["result-http-config-port"],
												},
												interval: argv["result-interval"],
												name: resolveFileToken(
													argv["result-name"] as string | undefined,
													"result-name",
													"text"
												),
												retries: argv["result-retries"],
												suspended: argv["result-suspended"],
												tcp_config: {
													method: argv["result-tcp-config-method"],
													port: argv["result-tcp-config-port"],
												},
												timeout: argv["result-timeout"],
												type: resolveFileToken(
													argv["result-type"] as string | undefined,
													"result-type",
													"text"
												),
											},
											success: argv["success"],
										},
										[["result", "http_config", "header"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							healthcheck_id: argv["healthcheck-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						errors: parseObjectArray(argv["errors"], "errors"),
						messages: parseObjectArray(argv["messages"], "messages"),
						result: {
							address: resolveFileToken(
								argv["result-address"] as string | undefined,
								"result-address",
								"text"
							),
							check_regions: argv["result-check-regions"],
							consecutive_fails: argv["result-consecutive-fails"],
							consecutive_successes: argv["result-consecutive-successes"],
							description: resolveFileToken(
								argv["result-description"] as string | undefined,
								"result-description",
								"text"
							),
							http_config: {
								allow_insecure: argv["result-http-config-allow-insecure"],
								expected_body: resolveFileToken(
									argv["result-http-config-expected-body"] as
										| string
										| undefined,
									"result-http-config-expected-body",
									"text"
								),
								expected_codes: argv["result-http-config-expected-codes"],
								follow_redirects: argv["result-http-config-follow-redirects"],
								header: parseJsonMap(
									argv["result-http-config-header"],
									"result-http-config-header"
								),
								method: argv["result-http-config-method"],
								path: resolveFileToken(
									argv["result-http-config-path"] as string | undefined,
									"result-http-config-path",
									"text"
								),
								port: argv["result-http-config-port"],
							},
							interval: argv["result-interval"],
							name: resolveFileToken(
								argv["result-name"] as string | undefined,
								"result-name",
								"text"
							),
							retries: argv["result-retries"],
							suspended: argv["result-suspended"],
							tcp_config: {
								method: argv["result-tcp-config-method"],
								port: argv["result-tcp-config-port"],
							},
							timeout: argv["result-timeout"],
							type: resolveFileToken(
								argv["result-type"] as string | undefined,
								"result-type",
								"text"
							),
						},
						success: argv["success"],
					},
					[["result", "http_config", "header"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						healthcheck_id: argv["healthcheck-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
