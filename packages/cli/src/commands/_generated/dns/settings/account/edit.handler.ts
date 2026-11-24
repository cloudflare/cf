import operation from "../../../_operations/dns/settings/account/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
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
			command: "dns settings account edit",
			classification: {
				safeFlags: [
					"enforce-dns-only",
					"zone-defaults-flatten-all-cnames",
					"zone-defaults-multi-provider",
					"zone-defaults-secondary-overrides",
					"zone-defaults-zone-mode",
					"zone-defaults-nameservers-type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId =
					argv.zone === undefined ? await resolveAccountIdSilent() : undefined;
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
				formatDryRun({
					command: "cf dns settings account edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/dns_settings`,
					pathParams: {
						"account-or-zone": String(accountOrZone),
						"account-or-zone-id": String(accountOrZoneId),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									enforce_dns_only: argv["enforce-dns-only"],
									zone_defaults: {
										flatten_all_cnames:
											argv["zone-defaults-flatten-all-cnames"],
										internal_dns: {
											reference_zone_id: resolveFileToken(
												argv["zone-defaults-internal-dns-reference-zone-id"] as
													| string
													| undefined,
												"zone-defaults-internal-dns-reference-zone-id",
												"text"
											),
										},
										multi_provider: argv["zone-defaults-multi-provider"],
										ns_ttl: argv["zone-defaults-ns-ttl"],
										secondary_overrides:
											argv["zone-defaults-secondary-overrides"],
										soa: {
											expire: argv["zone-defaults-soa-expire"],
											min_ttl: argv["zone-defaults-soa-min-ttl"],
											mname: resolveFileToken(
												argv["zone-defaults-soa-mname"] as string | undefined,
												"zone-defaults-soa-mname",
												"text"
											),
											refresh: argv["zone-defaults-soa-refresh"],
											retry: argv["zone-defaults-soa-retry"],
											rname: resolveFileToken(
												argv["zone-defaults-soa-rname"] as string | undefined,
												"zone-defaults-soa-rname",
												"text"
											),
											ttl: argv["zone-defaults-soa-ttl"],
										},
										zone_mode: argv["zone-defaults-zone-mode"],
										nameservers: {
											type: argv["zone-defaults-nameservers-type"],
										},
									},
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
			const accountOrZoneId =
				accountOrZone === "zones"
					? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })
					: argv.local
						? LOCAL_ACCOUNT_ID
						: await getAccountId();
			if (accountOrZone === "zones") {
				argv.zoneId = accountOrZoneId;
			} else {
				argv.accountId = accountOrZoneId;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				enforce_dns_only: argv["enforce-dns-only"],
				zone_defaults: {
					flatten_all_cnames: argv["zone-defaults-flatten-all-cnames"],
					internal_dns: {
						reference_zone_id: resolveFileToken(
							argv["zone-defaults-internal-dns-reference-zone-id"] as
								| string
								| undefined,
							"zone-defaults-internal-dns-reference-zone-id",
							"text"
						),
					},
					multi_provider: argv["zone-defaults-multi-provider"],
					ns_ttl: argv["zone-defaults-ns-ttl"],
					secondary_overrides: argv["zone-defaults-secondary-overrides"],
					soa: {
						expire: argv["zone-defaults-soa-expire"],
						min_ttl: argv["zone-defaults-soa-min-ttl"],
						mname: resolveFileToken(
							argv["zone-defaults-soa-mname"] as string | undefined,
							"zone-defaults-soa-mname",
							"text"
						),
						refresh: argv["zone-defaults-soa-refresh"],
						retry: argv["zone-defaults-soa-retry"],
						rname: resolveFileToken(
							argv["zone-defaults-soa-rname"] as string | undefined,
							"zone-defaults-soa-rname",
							"text"
						),
						ttl: argv["zone-defaults-soa-ttl"],
					},
					zone_mode: argv["zone-defaults-zone-mode"],
					nameservers: {
						type: argv["zone-defaults-nameservers-type"],
					},
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_or_zone: accountOrZone,
					account_or_zone_id: accountOrZoneId,
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
