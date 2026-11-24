import operation from "../../../_operations/dns/settings/account/edit.js";
/**
 * edit command
 * @generated from apis/overlays/dns.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "edit",
	describe: "Update DNS Settings",
	usage:
		"$0 dns settings account edit\n\nUpdate DNS settings for an account or zone\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"enforce-dns-only": {
			kind: "boolean",
			brief:
				"When enabled, forces all proxied DNS records in the account to behave as DNS-only at the edge, regardless of each record's individual proxy setting. Note that this account-level override does not modify the records themselves; it only affects how they are served at the edge. See more on [Enforce DNS-only](https://developers.cloudflare.com/dns/proxy-status/enforce-dns-only).",
			optional: true,
		},
		"zone-defaults-flatten-all-cnames": {
			kind: "boolean",
			brief:
				"Whether to flatten all CNAME records in the zone. Note that, due to DNS limitations, a CNAME record at the zone apex will always be flattened.",
			optional: true,
		},
		"zone-defaults-internal-dns-reference-zone-id": {
			kind: "parsed",
			brief: "The ID of the zone to fallback to.",
			optional: true,
			parse: String,
		},
		"zone-defaults-multi-provider": {
			kind: "boolean",
			brief:
				"Whether to enable multi-provider DNS, which causes Cloudflare to activate the zone even when non-Cloudflare NS records exist, and to respect NS records at the zone apex during outbound zone transfers.",
			optional: true,
		},
		"zone-defaults-ns-ttl": {
			kind: "parsed",
			brief: "The time to live (TTL) of the zone's nameserver (NS) records.",
			optional: true,
			parse: Number,
		},
		"zone-defaults-secondary-overrides": {
			kind: "boolean",
			brief:
				"Allows a Secondary DNS zone to use (proxied) override records and CNAME flattening at the zone apex.",
			optional: true,
		},
		"zone-defaults-soa-expire": {
			kind: "parsed",
			brief:
				"Time in seconds of being unable to query the primary server after which secondary servers should stop serving the zone.",
			optional: true,
			parse: Number,
		},
		"zone-defaults-soa-min-ttl": {
			kind: "parsed",
			brief:
				"The time to live (TTL) for negative caching of records within the zone.",
			optional: true,
			parse: Number,
		},
		"zone-defaults-soa-mname": {
			kind: "parsed",
			brief:
				"The primary nameserver, which may be used for outbound zone transfers. If null, a Cloudflare-assigned value will be used.",
			optional: true,
			parse: String,
		},
		"zone-defaults-soa-refresh": {
			kind: "parsed",
			brief:
				"Time in seconds after which secondary servers should re-check the SOA record to see if the zone has been updated.",
			optional: true,
			parse: Number,
		},
		"zone-defaults-soa-retry": {
			kind: "parsed",
			brief:
				"Time in seconds after which secondary servers should retry queries after the primary server was unresponsive.",
			optional: true,
			parse: Number,
		},
		"zone-defaults-soa-rname": {
			kind: "parsed",
			brief:
				"The email address of the zone administrator, with the first label representing the local part of the email address.",
			optional: true,
			parse: String,
		},
		"zone-defaults-soa-ttl": {
			kind: "parsed",
			brief: "The time to live (TTL) of the SOA record itself.",
			optional: true,
			parse: Number,
		},
		"zone-defaults-zone-mode": {
			kind: "parsed",
			brief: "Whether the zone mode is a regular or CDN/DNS only zone.",
			optional: true,
			choices: ["standard", "cdn_only", "dns_only"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "zone-defaults-zone-mode", "text"),
		},
		"zone-defaults-nameservers-type": {
			kind: "parsed",
			brief: "Nameserver type",
			optional: true,
			choices: [
				"cloudflare.standard",
				"cloudflare.advanced",
				"cloudflare.standard.random",
				"custom.account",
				"custom.tenant",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "zone-defaults-nameservers-type", "text"),
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
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
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
													argv[
														"zone-defaults-internal-dns-reference-zone-id"
													] as string | undefined,
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
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
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
		),
});

export default command;
