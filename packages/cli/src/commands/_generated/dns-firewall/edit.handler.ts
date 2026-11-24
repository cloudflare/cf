import operation from "../_operations/dns-firewall/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "dns-firewall edit",
			classification: {
				safeFlags: [
					"attack-mitigation-enabled",
					"attack-mitigation-only-when-upstream-unhealthy",
					"deprecate-any-requests",
					"ecs-fallback",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf dns-firewall edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_firewall/${argv["dns-firewall-id"] == null ? "<dns-firewall-id>" : encodeURIComponent(String(argv["dns-firewall-id"]))}`,
					pathParams: {
						"dns-firewall-id": String(argv["dns-firewall-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									attack_mitigation: {
										enabled: argv["attack-mitigation-enabled"],
										only_when_upstream_unhealthy:
											argv["attack-mitigation-only-when-upstream-unhealthy"],
									},
									deprecate_any_requests: argv["deprecate-any-requests"],
									ecs_fallback: argv["ecs-fallback"],
									maximum_cache_ttl: argv["maximum-cache-ttl"],
									minimum_cache_ttl: argv["minimum-cache-ttl"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									negative_cache_ttl: argv["negative-cache-ttl"],
									ratelimit: argv["ratelimit"],
									retries: argv["retries"],
									upstream_ips: argv["upstream-ips"],
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
						dns_firewall_id: argv["dns-firewall-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				attack_mitigation: {
					enabled: argv["attack-mitigation-enabled"],
					only_when_upstream_unhealthy:
						argv["attack-mitigation-only-when-upstream-unhealthy"],
				},
				deprecate_any_requests: argv["deprecate-any-requests"],
				ecs_fallback: argv["ecs-fallback"],
				maximum_cache_ttl: argv["maximum-cache-ttl"],
				minimum_cache_ttl: argv["minimum-cache-ttl"],
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				negative_cache_ttl: argv["negative-cache-ttl"],
				ratelimit: argv["ratelimit"],
				retries: argv["retries"],
				upstream_ips: argv["upstream-ips"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					dns_firewall_id: argv["dns-firewall-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
