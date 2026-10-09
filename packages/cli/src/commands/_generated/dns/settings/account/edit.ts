import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/dns.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 dns settings account edit\n\nUpdate DNS settings for an account or zone"
		)
		.option("enforce-dns-only", {
			type: "boolean",
			description:
				"When enabled, forces all proxied DNS records in the account to behave as DNS-only at the edge, regardless of each record's individual proxy setting. Note that this account-level override does not modify the records themselves; it only affects how they are served at the edge. See more on [Enforce DNS-only](https://developers.cloudflare.com/dns/proxy-status/enforce-dns-only).",
		})
		.option("zone-defaults-flatten-all-cnames", {
			type: "boolean",
			description:
				"Whether to flatten all CNAME records in the zone. Note that, due to DNS limitations, a CNAME record at the zone apex will always be flattened.",
		})
		.option("zone-defaults-foundation-dns", {
			type: "boolean",
			description:
				"Deprecated. Use nameservers.type to configure Advanced Nameservers.",
		})
		.option("zone-defaults-internal-dns-reference-zone-id", {
			type: "string",
			description: "The ID of the zone to fallback to.",
		})
		.option("zone-defaults-multi-provider", {
			type: "boolean",
			description:
				"Whether to enable multi-provider DNS, which causes Cloudflare to activate the zone even when non-Cloudflare NS records exist, and to respect NS records at the zone apex during outbound zone transfers.",
		})
		.option("zone-defaults-ns-ttl", {
			type: "number",
			description:
				"The time to live (TTL) of the zone's nameserver (NS) records.",
		})
		.option("zone-defaults-secondary-overrides", {
			type: "boolean",
			description:
				"Allows a Secondary DNS zone to use (proxied) override records and CNAME flattening at the zone apex.",
		})
		.option("zone-defaults-soa-expire", {
			type: "number",
			description:
				"Time in seconds of being unable to query the primary server after which secondary servers should stop serving the zone.",
		})
		.option("zone-defaults-soa-min-ttl", {
			type: "number",
			description:
				"The time to live (TTL) for negative caching of records within the zone.",
		})
		.option("zone-defaults-soa-mname", {
			type: "string",
			description:
				"The primary nameserver, which may be used for outbound zone transfers. If null, a Cloudflare-assigned value will be used.",
		})
		.option("zone-defaults-soa-refresh", {
			type: "number",
			description:
				"Time in seconds after which secondary servers should re-check the SOA record to see if the zone has been updated.",
		})
		.option("zone-defaults-soa-retry", {
			type: "number",
			description:
				"Time in seconds after which secondary servers should retry queries after the primary server was unresponsive.",
		})
		.option("zone-defaults-soa-rname", {
			type: "string",
			description:
				"The email address of the zone administrator, with the first label representing the local part of the email address.",
		})
		.option("zone-defaults-soa-ttl", {
			type: "number",
			description: "The time to live (TTL) of the SOA record itself.",
		})
		.option("zone-defaults-zone-mode", {
			type: "string",
			description: "Whether the zone mode is a regular or CDN/DNS only zone.",
			choices: ["standard", "cdn_only", "dns_only"],
		})
		.coerce("zone-defaults-zone-mode", (value: string | undefined) =>
			resolveFileToken(value, "zone-defaults-zone-mode", "text")
		)
		.option("zone-defaults-nameservers-type", {
			type: "string",
			description: "Nameserver type",
			choices: [
				"cloudflare.standard",
				"cloudflare.advanced",
				"cloudflare.standard.random",
				"custom.account",
				"custom.tenant",
			],
		})
		.coerce("zone-defaults-nameservers-type", (value: string | undefined) =>
			resolveFileToken(value, "zone-defaults-nameservers-type", "text")
		)
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

type Request =
	SdkRequest<"generated:patch:/{account_or_zone}/{account_or_zone_id}/dns_settings">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit",
	describe: "Update DNS Settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns settings account edit",
				classification: {
					safeFlags: [
						"enforce-dns-only",
						"zone-defaults-flatten-all-cnames",
						"zone-defaults-foundation-dns",
						"zone-defaults-multi-provider",
						"zone-defaults-secondary-overrides",
						"zone-defaults-zone-mode",
						"zone-defaults-nameservers-type",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
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
											foundation_dns: argv["zone-defaults-foundation-dns"],
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

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.dns.settings.account.edit({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					enforce_dns_only: argv["enforce-dns-only"],
					zone_defaults: {
						flatten_all_cnames: argv["zone-defaults-flatten-all-cnames"],
						foundation_dns: argv["zone-defaults-foundation-dns"],
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
					client.dns.settings.account.edit({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
