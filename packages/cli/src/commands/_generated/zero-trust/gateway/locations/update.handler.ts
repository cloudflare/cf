import operation from "../../../_operations/zero-trust/gateway/locations/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
			command: "zero-trust gateway locations update",
			classification: {
				safeFlags: [
					"client-default",
					"dns64-enabled",
					"ecs-support",
					"endpoints-doh-enabled",
					"endpoints-doh-require-token",
					"endpoints-dot-enabled",
					"endpoints-ipv4-enabled",
					"endpoints-ipv6-enabled",
					"max-ttl-mode",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Specify the location name."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust gateway locations update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/locations/${argv["location-id"] == null ? "<location-id>" : encodeURIComponent(String(argv["location-id"]))}`,
					pathParams: { "location-id": String(argv["location-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									client_default: argv["client-default"],
									dns64_enabled: argv["dns64-enabled"],
									dns_destination_ips_id: resolveFileToken(
										argv["dns-destination-ips-id"] as string | undefined,
										"dns-destination-ips-id",
										"text"
									),
									ecs_support: argv["ecs-support"],
									endpoints: {
										doh: {
											enabled: argv["endpoints-doh-enabled"],
											networks: parseObjectArray(
												argv["endpoints-doh-networks"],
												"endpoints-doh-networks",
												true
											),
											require_token: argv["endpoints-doh-require-token"],
										},
										dot: {
											enabled: argv["endpoints-dot-enabled"],
											networks: parseObjectArray(
												argv["endpoints-dot-networks"],
												"endpoints-dot-networks",
												true
											),
										},
										ipv4: {
											enabled: argv["endpoints-ipv4-enabled"],
										},
										ipv6: {
											enabled: argv["endpoints-ipv6-enabled"],
											networks: parseObjectArray(
												argv["endpoints-ipv6-networks"],
												"endpoints-ipv6-networks",
												true
											),
										},
									},
									max_ttl: {
										mode: argv["max-ttl-mode"],
										ttl_secs: argv["max-ttl-ttl-secs"],
									},
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									networks: parseObjectArray(
										argv["networks"],
										"networks",
										true
									),
								}),
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
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						location_id: argv["location-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				client_default: argv["client-default"],
				dns64_enabled: argv["dns64-enabled"],
				dns_destination_ips_id: resolveFileToken(
					argv["dns-destination-ips-id"] as string | undefined,
					"dns-destination-ips-id",
					"text"
				),
				ecs_support: argv["ecs-support"],
				endpoints: {
					doh: {
						enabled: argv["endpoints-doh-enabled"],
						networks: parseObjectArray(
							argv["endpoints-doh-networks"],
							"endpoints-doh-networks",
							true
						),
						require_token: argv["endpoints-doh-require-token"],
					},
					dot: {
						enabled: argv["endpoints-dot-enabled"],
						networks: parseObjectArray(
							argv["endpoints-dot-networks"],
							"endpoints-dot-networks",
							true
						),
					},
					ipv4: {
						enabled: argv["endpoints-ipv4-enabled"],
					},
					ipv6: {
						enabled: argv["endpoints-ipv6-enabled"],
						networks: parseObjectArray(
							argv["endpoints-ipv6-networks"],
							"endpoints-ipv6-networks",
							true
						),
					},
				},
				max_ttl: {
					mode: argv["max-ttl-mode"],
					ttl_secs: argv["max-ttl-ttl-secs"],
				},
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				networks: parseObjectArray(argv["networks"], "networks", true),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					location_id: argv["location-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
