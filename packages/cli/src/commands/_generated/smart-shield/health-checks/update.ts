import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/smart-shield.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 smart-shield health-checks update <healthcheck-id>\n\nUpdate a configured health check."
		)
		.positional("healthcheck-id", {
			type: "string",
			description: "Identifier.",
			demandOption: true,
		})
		.option("errors", {
			type: "string",
			description:
				"The errors field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("messages", {
			type: "string",
			description:
				"The messages field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("result-address", {
			type: "string",
			description:
				"The hostname or IP address of the origin server to run health checks on.",
		})
		.option("result-check-regions", {
			type: "string",
			array: true,
			description:
				"A list of regions from which to run health checks. Null means Cloudflare will pick a default region.",
		})
		.option("result-consecutive-fails", {
			type: "number",
			description:
				"The number of consecutive fails required from a health check before changing the health to unhealthy.",
		})
		.option("result-consecutive-successes", {
			type: "number",
			description:
				"The number of consecutive successes required from a health check before changing the health to healthy.",
		})
		.option("result-description", {
			type: "string",
			description: "A human-readable description of the health check.",
		})
		.option("result-http-config-allow-insecure", {
			type: "boolean",
			description:
				"Do not validate the certificate when the health check uses HTTPS.",
		})
		.option("result-http-config-expected-body", {
			type: "string",
			description:
				"A case-insensitive sub-string to look for in the response body. If this string is not found, the origin will be marked as unhealthy.",
		})
		.option("result-http-config-expected-codes", {
			type: "string",
			array: true,
			description:
				'The expected HTTP response codes (e.g. "200") or code ranges (e.g. "2xx" for all codes starting with 2) of the health check.',
		})
		.option("result-http-config-follow-redirects", {
			type: "boolean",
			description: "Follow redirects if the origin returns a 3xx status code.",
		})
		.option("result-http-config-method", {
			type: "string",
			description: "The HTTP method to use for the health check.",
			choices: ["GET", "HEAD"],
		})
		.coerce("result-http-config-method", (value) =>
			resolveFileToken(value, "result-http-config-method", "text")
		)
		.option("result-http-config-path", {
			type: "string",
			description: "The endpoint path to health check against.",
		})
		.option("result-http-config-port", {
			type: "number",
			description:
				"Port number to connect to for the health check. Defaults to 80 if type is HTTP or 443 if type is HTTPS.",
		})
		.option("result-interval", {
			type: "number",
			description:
				"The interval between each health check. Shorter intervals may give quicker notifications if the origin status changes, but will increase load on the origin as we check from multiple locations.",
		})
		.option("result-name", {
			type: "string",
			description:
				"A short name to identify the health check. Only alphanumeric characters, hyphens and underscores are allowed.",
		})
		.option("result-retries", {
			type: "number",
			description:
				"The number of retries to attempt in case of a timeout before marking the origin as unhealthy. Retries are attempted immediately.",
		})
		.option("result-suspended", {
			type: "boolean",
			description: "If suspended, no health checks are sent to the origin.",
		})
		.option("result-tcp-config-method", {
			type: "string",
			description: "The TCP connection method to use for the health check.",
			choices: ["connection_established"],
		})
		.coerce("result-tcp-config-method", (value) =>
			resolveFileToken(value, "result-tcp-config-method", "text")
		)
		.option("result-tcp-config-port", {
			type: "number",
			description:
				"Port number to connect to for the health check. Defaults to 80.",
		})
		.option("result-timeout", {
			type: "number",
			description:
				"The timeout (in seconds) before marking the health check as failed.",
		})
		.option("result-type", {
			type: "string",
			description:
				"The protocol to use for the health check. Currently supported protocols are 'HTTP', 'HTTPS' and 'TCP'.",
		})
		.option("success", {
			type: "boolean",
			description: "Whether the API call was successful.",
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

type Request = SdkRequest<"smart-shield-update-health-check">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <healthcheck-id>",
	describe: "Update Health Check",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf smart-shield health-checks update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/smart_shield/healthchecks/${argv["healthcheck-id"] == null ? "<healthcheck-id>" : encodeURIComponent(String(argv["healthcheck-id"]))}`,
						pathParams: {
							"healthcheck-id": String(argv["healthcheck-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.smartShield.healthChecks.update({
							...bodyData,
							zone_id: zoneId,
							healthcheck_id: argv["healthcheck-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
								argv["result-http-config-expected-body"] as string | undefined,
								"result-http-config-expected-body",
								"text"
							),
							expected_codes: argv["result-http-config-expected-codes"],
							follow_redirects: argv["result-http-config-follow-redirects"],
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
				});
				const result = await withProgress(`Updating`, async () =>
					client.smartShield.healthChecks.update({
						...bodyData,
						zone_id: zoneId,
						healthcheck_id: argv["healthcheck-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
