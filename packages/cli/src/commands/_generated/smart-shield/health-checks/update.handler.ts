import operation from "../../_operations/smart-shield/health-checks/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
								argv["result-http-config-expected-body"] as string | undefined,
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
	);
}
