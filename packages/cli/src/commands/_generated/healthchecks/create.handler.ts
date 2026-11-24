import operation from "../_operations/healthchecks/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "healthchecks create",
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
					command: "cf healthchecks create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/healthchecks`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
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
	);
}
