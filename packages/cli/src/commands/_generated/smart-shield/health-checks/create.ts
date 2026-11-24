import operation from "../../_operations/smart-shield/health-checks/create.js";
/**
 * create command
 * @generated from apis/overlays/smart-shield.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create Health Check",
	usage: "$0 smart-shield health-checks create\n\nCreate a new health check.",
	flags: {
		address: {
			kind: "parsed",
			brief:
				"The hostname or IP address of the origin server to run health checks on.",
			optional: true,
			parse: String,
		},
		"check-regions": {
			kind: "parsed",
			brief:
				"A list of regions from which to run health checks. Null means Cloudflare will pick a default region.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"consecutive-fails": {
			kind: "parsed",
			brief:
				"The number of consecutive fails required from a health check before changing the health to unhealthy.",
			default: "1",
			parse: Number,
		},
		"consecutive-successes": {
			kind: "parsed",
			brief:
				"The number of consecutive successes required from a health check before changing the health to healthy.",
			default: "1",
			parse: Number,
		},
		description: {
			kind: "parsed",
			brief: "A human-readable description of the health check.",
			optional: true,
			parse: String,
		},
		"http-config-allow-insecure": {
			kind: "boolean",
			brief:
				"Do not validate the certificate when the health check uses HTTPS.",
			optional: true,
		},
		"http-config-expected-body": {
			kind: "parsed",
			brief:
				"A case-insensitive sub-string to look for in the response body. If this string is not found, the origin will be marked as unhealthy.",
			optional: true,
			parse: String,
		},
		"http-config-expected-codes": {
			kind: "parsed",
			brief:
				'The expected HTTP response codes (e.g. "200") or code ranges (e.g. "2xx" for all codes starting with 2) of the health check.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"http-config-follow-redirects": {
			kind: "boolean",
			brief: "Follow redirects if the origin returns a 3xx status code.",
			optional: true,
		},
		"http-config-header": {
			kind: "parsed",
			brief:
				'The HTTP request headers to send in the health check. It is recommended you set a Host header by default. The User-Agent header cannot be overridden. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [string]}.',
			optional: true,
			parse: String,
		},
		"http-config-method": {
			kind: "parsed",
			brief: "The HTTP method to use for the health check.",
			optional: true,
			choices: ["GET", "HEAD"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "http-config-method", "text"),
		},
		"http-config-path": {
			kind: "parsed",
			brief: "The endpoint path to health check against.",
			optional: true,
			parse: String,
		},
		"http-config-port": {
			kind: "parsed",
			brief:
				"Port number to connect to for the health check. Defaults to 80 if type is HTTP or 443 if type is HTTPS.",
			optional: true,
			parse: Number,
		},
		interval: {
			kind: "parsed",
			brief:
				"The interval between each health check. Shorter intervals may give quicker notifications if the origin status changes, but will increase load on the origin as we check from multiple locations.",
			default: "60",
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"A short name to identify the health check. Only alphanumeric characters, hyphens and underscores are allowed.",
			optional: true,
			parse: String,
		},
		retries: {
			kind: "parsed",
			brief:
				"The number of retries to attempt in case of a timeout before marking the origin as unhealthy. Retries are attempted immediately.",
			default: "2",
			parse: Number,
		},
		suspended: {
			kind: "boolean",
			brief: "If suspended, no health checks are sent to the origin.",
			default: false,
		},
		"tcp-config-method": {
			kind: "parsed",
			brief: "The TCP connection method to use for the health check.",
			optional: true,
			choices: ["connection_established"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "tcp-config-method", "text"),
		},
		"tcp-config-port": {
			kind: "parsed",
			brief: "Port number to connect to for the health check. Defaults to 80.",
			optional: true,
			parse: Number,
		},
		timeout: {
			kind: "parsed",
			brief:
				"The timeout (in seconds) before marking the health check as failed.",
			default: "5",
			parse: Number,
		},
		type: {
			kind: "parsed",
			brief:
				"The protocol to use for the health check. Currently supported protocols are 'HTTP', 'HTTPS' and 'TCP'.",
			default: "HTTP",
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
				command: "smart-shield health-checks create",
				classification: {
					safeFlags: [
						"http-config-allow-insecure",
						"http-config-follow-redirects",
						"http-config-method",
						"suspended",
						"tcp-config-method",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["address"] === undefined) {
						argv["address"] = await promptForRequiredField(
							"address",
							"The hostname or IP address of the origin server to run health checks on."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"A short name to identify the health check. Only alphanumeric characters, hyphens and underscores are allowed."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf smart-shield health-checks create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/smart_shield/healthchecks`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											address: resolveFileToken(
												argv["address"] as string | undefined,
												"address",
												"text"
											),
											check_regions: argv["check-regions"],
											consecutive_fails: argv["consecutive-fails"],
											consecutive_successes: argv["consecutive-successes"],
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											http_config: {
												allow_insecure: argv["http-config-allow-insecure"],
												expected_body: resolveFileToken(
													argv["http-config-expected-body"] as
														| string
														| undefined,
													"http-config-expected-body",
													"text"
												),
												expected_codes: argv["http-config-expected-codes"],
												follow_redirects: argv["http-config-follow-redirects"],
												header: parseJsonMap(
													argv["http-config-header"],
													"http-config-header"
												),
												method: argv["http-config-method"],
												path: resolveFileToken(
													argv["http-config-path"] as string | undefined,
													"http-config-path",
													"text"
												),
												port: argv["http-config-port"],
											},
											interval: argv["interval"],
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											retries: argv["retries"],
											suspended: argv["suspended"],
											tcp_config: {
												method: argv["tcp-config-method"],
												port: argv["tcp-config-port"],
											},
											timeout: argv["timeout"],
											type: resolveFileToken(
												argv["type"] as string | undefined,
												"type",
												"text"
											),
										},
										[["http_config", "header"]]
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						address: resolveFileToken(
							argv["address"] as string | undefined,
							"address",
							"text"
						),
						check_regions: argv["check-regions"],
						consecutive_fails: argv["consecutive-fails"],
						consecutive_successes: argv["consecutive-successes"],
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						http_config: {
							allow_insecure: argv["http-config-allow-insecure"],
							expected_body: resolveFileToken(
								argv["http-config-expected-body"] as string | undefined,
								"http-config-expected-body",
								"text"
							),
							expected_codes: argv["http-config-expected-codes"],
							follow_redirects: argv["http-config-follow-redirects"],
							header: parseJsonMap(
								argv["http-config-header"],
								"http-config-header"
							),
							method: argv["http-config-method"],
							path: resolveFileToken(
								argv["http-config-path"] as string | undefined,
								"http-config-path",
								"text"
							),
							port: argv["http-config-port"],
						},
						interval: argv["interval"],
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						retries: argv["retries"],
						suspended: argv["suspended"],
						tcp_config: {
							method: argv["tcp-config-method"],
							port: argv["tcp-config-port"],
						},
						timeout: argv["timeout"],
						type: resolveFileToken(
							argv["type"] as string | undefined,
							"type",
							"text"
						),
					},
					[["http_config", "header"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
