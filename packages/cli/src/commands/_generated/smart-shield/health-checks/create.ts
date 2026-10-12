import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/smart-shield.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 smart-shield health-checks create\n\nCreate a new health check.")
		.option("address", {
			type: "string",
			description:
				"The hostname or IP address of the origin server to run health checks on.",
		})
		.option("check-regions", {
			type: "string",
			array: true,
			description:
				"A list of regions from which to run health checks. Null means Cloudflare will pick a default region.",
		})
		.option("consecutive-fails", {
			type: "number",
			description:
				"The number of consecutive fails required from a health check before changing the health to unhealthy.",
			default: 1,
		})
		.option("consecutive-successes", {
			type: "number",
			description:
				"The number of consecutive successes required from a health check before changing the health to healthy.",
			default: 1,
		})
		.option("description", {
			type: "string",
			description: "A human-readable description of the health check.",
		})
		.option("http-config-allow-insecure", {
			type: "boolean",
			description:
				"Do not validate the certificate when the health check uses HTTPS.",
		})
		.option("http-config-expected-body", {
			type: "string",
			description:
				"A case-insensitive sub-string to look for in the response body. If this string is not found, the origin will be marked as unhealthy.",
		})
		.option("http-config-expected-codes", {
			type: "string",
			array: true,
			description:
				'The expected HTTP response codes (e.g. "200") or code ranges (e.g. "2xx" for all codes starting with 2) of the health check.',
		})
		.option("http-config-follow-redirects", {
			type: "boolean",
			description: "Follow redirects if the origin returns a 3xx status code.",
		})
		.option("http-config-method", {
			type: "string",
			description: "The HTTP method to use for the health check.",
			choices: ["GET", "HEAD"],
		})
		.coerce("http-config-method", (value) =>
			resolveFileToken(value, "http-config-method", "text")
		)
		.option("http-config-path", {
			type: "string",
			description: "The endpoint path to health check against.",
		})
		.option("http-config-port", {
			type: "number",
			description:
				"Port number to connect to for the health check. Defaults to 80 if type is HTTP or 443 if type is HTTPS.",
		})
		.option("interval", {
			type: "number",
			description:
				"The interval between each health check. Shorter intervals may give quicker notifications if the origin status changes, but will increase load on the origin as we check from multiple locations.",
			default: 60,
		})
		.option("name", {
			type: "string",
			description:
				"A short name to identify the health check. Only alphanumeric characters, hyphens and underscores are allowed.",
		})
		.option("retries", {
			type: "number",
			description:
				"The number of retries to attempt in case of a timeout before marking the origin as unhealthy. Retries are attempted immediately.",
			default: 2,
		})
		.option("suspended", {
			type: "boolean",
			description: "If suspended, no health checks are sent to the origin.",
			default: false,
		})
		.option("tcp-config-method", {
			type: "string",
			description: "The TCP connection method to use for the health check.",
			choices: ["connection_established"],
		})
		.coerce("tcp-config-method", (value) =>
			resolveFileToken(value, "tcp-config-method", "text")
		)
		.option("tcp-config-port", {
			type: "number",
			description:
				"Port number to connect to for the health check. Defaults to 80.",
		})
		.option("timeout", {
			type: "number",
			description:
				"The timeout (in seconds) before marking the health check as failed.",
			default: 5,
		})
		.option("type", {
			type: "string",
			description:
				"The protocol to use for the health check. Currently supported protocols are 'HTTP', 'HTTPS' and 'TCP'.",
			default: "HTTP",
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

type Request = SdkRequest<"smart-shield-create-health-check">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Health Check",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
								: compactBody({
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.smartShield.healthChecks.create({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.smartShield.healthChecks.create({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
