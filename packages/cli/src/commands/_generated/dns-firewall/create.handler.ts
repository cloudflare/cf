import operation from "../_operations/dns-firewall/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "dns-firewall create",
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
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"DNS Firewall cluster name"
					);
				}
				if (argv["upstream-ips"] === undefined) {
					throw new Error(
						"--upstream-ips is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf dns-firewall create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_firewall`,
					pathParams: {},
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
									dns_firewall_ip_count: argv["dns-firewall-ip-count"],
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

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
				dns_firewall_ip_count: argv["dns-firewall-ip-count"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
