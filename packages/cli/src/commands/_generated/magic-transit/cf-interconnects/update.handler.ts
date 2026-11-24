import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "magic-transit cf-interconnects update",
			classification: {
				safeFlags: [
					"automatic-return-routing",
					"health-check-enabled",
					"health-check-rate",
					"health-check-type",
					"health-check-direction",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["x-magic-new-hc-target"] !== undefined)
				headers["x-magic-new-hc-target"] = String(
					argv["x-magic-new-hc-target"]
				);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf magic-transit cf-interconnects update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cf_interconnects/${argv["cf-interconnect-id"] == null ? "<cf-interconnect-id>" : encodeURIComponent(String(argv["cf-interconnect-id"]))}`,
					pathParams: {
						"cf-interconnect-id": String(argv["cf-interconnect-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									automatic_return_routing: argv["automatic-return-routing"],
									bgp: {
										as_no: argv["bgp-as-no"],
										cloudflare_endpoint: resolveFileToken(
											argv["bgp-cloudflare-endpoint"] as string | undefined,
											"bgp-cloudflare-endpoint",
											"text"
										),
										customer_asn: argv["bgp-customer-asn"],
										customer_endpoint: resolveFileToken(
											argv["bgp-customer-endpoint"] as string | undefined,
											"bgp-customer-endpoint",
											"text"
										),
										export_filter_id: resolveFileToken(
											argv["bgp-export-filter-id"] as string | undefined,
											"bgp-export-filter-id",
											"text"
										),
										extra_prefixes: argv["bgp-extra-prefixes"],
										import_filter_id: resolveFileToken(
											argv["bgp-import-filter-id"] as string | undefined,
											"bgp-import-filter-id",
											"text"
										),
										md5_key: resolveFileToken(
											argv["bgp-md5-key"] as string | undefined,
											"bgp-md5-key",
											"text"
										),
									},
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									gre: {
										cloudflare_endpoint: resolveFileToken(
											argv["gre-cloudflare-endpoint"] as string | undefined,
											"gre-cloudflare-endpoint",
											"text"
										),
									},
									health_check: {
										enabled: argv["health-check-enabled"],
										rate: argv["health-check-rate"],
										target: {
											saved: resolveFileToken(
												argv["health-check-target-saved"] as string | undefined,
												"health-check-target-saved",
												"text"
											),
										},
										type: argv["health-check-type"],
										direction: argv["health-check-direction"],
										source: resolveFileToken(
											argv["health-check-source"] as string | undefined,
											"health-check-source",
											"text"
										),
									},
									interface_address: resolveFileToken(
										argv["interface-address"] as string | undefined,
										"interface-address",
										"text"
									),
									interface_address6: resolveFileToken(
										argv["interface-address6"] as string | undefined,
										"interface-address6",
										"text"
									),
									mtu: argv["mtu"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
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
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/magic/cf_interconnects/${encodeURIComponent(String(argv["cf-interconnect-id"]))}`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["automatic-return-routing"] !== undefined)
				setNestedValue(
					bodyData,
					["automatic_return_routing"],
					argv["automatic-return-routing"]
				);
			if (argv["bgp-as-no"] !== undefined)
				setNestedValue(bodyData, ["bgp", "as_no"], argv["bgp-as-no"]);
			if (argv["bgp-cloudflare-endpoint"] !== undefined)
				setNestedValue(
					bodyData,
					["bgp", "cloudflare_endpoint"],
					resolveFileToken(
						argv["bgp-cloudflare-endpoint"] as string | undefined,
						"bgp-cloudflare-endpoint",
						"text"
					)
				);
			if (argv["bgp-customer-asn"] !== undefined)
				setNestedValue(
					bodyData,
					["bgp", "customer_asn"],
					argv["bgp-customer-asn"]
				);
			if (argv["bgp-customer-endpoint"] !== undefined)
				setNestedValue(
					bodyData,
					["bgp", "customer_endpoint"],
					resolveFileToken(
						argv["bgp-customer-endpoint"] as string | undefined,
						"bgp-customer-endpoint",
						"text"
					)
				);
			if (argv["bgp-export-filter-id"] !== undefined)
				setNestedValue(
					bodyData,
					["bgp", "export_filter_id"],
					resolveFileToken(
						argv["bgp-export-filter-id"] as string | undefined,
						"bgp-export-filter-id",
						"text"
					)
				);
			if (argv["bgp-extra-prefixes"] !== undefined)
				setNestedValue(
					bodyData,
					["bgp", "extra_prefixes"],
					argv["bgp-extra-prefixes"]
				);
			if (argv["bgp-import-filter-id"] !== undefined)
				setNestedValue(
					bodyData,
					["bgp", "import_filter_id"],
					resolveFileToken(
						argv["bgp-import-filter-id"] as string | undefined,
						"bgp-import-filter-id",
						"text"
					)
				);
			if (argv["bgp-md5-key"] !== undefined)
				setNestedValue(
					bodyData,
					["bgp", "md5_key"],
					resolveFileToken(
						argv["bgp-md5-key"] as string | undefined,
						"bgp-md5-key",
						"text"
					)
				);
			if (argv["description"] !== undefined)
				setNestedValue(
					bodyData,
					["description"],
					resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					)
				);
			if (argv["gre-cloudflare-endpoint"] !== undefined)
				setNestedValue(
					bodyData,
					["gre", "cloudflare_endpoint"],
					resolveFileToken(
						argv["gre-cloudflare-endpoint"] as string | undefined,
						"gre-cloudflare-endpoint",
						"text"
					)
				);
			if (argv["health-check-enabled"] !== undefined)
				setNestedValue(
					bodyData,
					["health_check", "enabled"],
					argv["health-check-enabled"]
				);
			if (argv["health-check-rate"] !== undefined)
				setNestedValue(
					bodyData,
					["health_check", "rate"],
					argv["health-check-rate"]
				);
			if (argv["health-check-target-saved"] !== undefined)
				setNestedValue(
					bodyData,
					["health_check", "target", "saved"],
					resolveFileToken(
						argv["health-check-target-saved"] as string | undefined,
						"health-check-target-saved",
						"text"
					)
				);
			if (argv["health-check-type"] !== undefined)
				setNestedValue(
					bodyData,
					["health_check", "type"],
					argv["health-check-type"]
				);
			if (argv["health-check-direction"] !== undefined)
				setNestedValue(
					bodyData,
					["health_check", "direction"],
					argv["health-check-direction"]
				);
			if (argv["health-check-source"] !== undefined)
				setNestedValue(
					bodyData,
					["health_check", "source"],
					resolveFileToken(
						argv["health-check-source"] as string | undefined,
						"health-check-source",
						"text"
					)
				);
			if (argv["interface-address"] !== undefined)
				setNestedValue(
					bodyData,
					["interface_address"],
					resolveFileToken(
						argv["interface-address"] as string | undefined,
						"interface-address",
						"text"
					)
				);
			if (argv["interface-address6"] !== undefined)
				setNestedValue(
					bodyData,
					["interface_address6"],
					resolveFileToken(
						argv["interface-address6"] as string | undefined,
						"interface-address6",
						"text"
					)
				);
			if (argv["mtu"] !== undefined)
				setNestedValue(bodyData, ["mtu"], argv["mtu"]);
			if (argv["name"] !== undefined)
				setNestedValue(
					bodyData,
					["name"],
					resolveFileToken(argv["name"] as string | undefined, "name", "text")
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PUT",
					`/accounts/${accountId}/magic/cf_interconnects/${encodeURIComponent(String(argv["cf-interconnect-id"]))}`,
					{
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
