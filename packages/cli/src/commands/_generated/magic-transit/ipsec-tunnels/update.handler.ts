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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "magic-transit ipsec-tunnels update",
			classification: {
				safeFlags: [
					"automatic-return-routing",
					"health-check-enabled",
					"health-check-rate",
					"health-check-type",
					"health-check-direction",
					"replay-protection",
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
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["cloudflare-endpoint"] === undefined) {
					argv["cloudflare-endpoint"] = await promptForRequiredField(
						"cloudflare-endpoint",
						"The IP address assigned to the Cloudflare side of the IPsec tunnel."
					);
				}
				if (argv["interface-address"] === undefined) {
					argv["interface-address"] = await promptForRequiredField(
						"interface-address",
						"A 31-bit prefix (/31 in CIDR notation) supporting two hosts, one for each side of the tunnel. Select the subnet from the following private IP space: 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255, 192.168.0.0–192.168.255.255."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the IPsec tunnel. The name cannot share a name with other tunnels."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf magic-transit ipsec-tunnels update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/ipsec_tunnels/${argv["ipsec-tunnel-id"] == null ? "<ipsec-tunnel-id>" : encodeURIComponent(String(argv["ipsec-tunnel-id"]))}`,
					pathParams: {
						"ipsec-tunnel-id": String(argv["ipsec-tunnel-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									automatic_return_routing: argv["automatic-return-routing"],
									bgp: {
										customer_asn: argv["bgp-customer-asn"],
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
									cloudflare_endpoint: resolveFileToken(
										argv["cloudflare-endpoint"] as string | undefined,
										"cloudflare-endpoint",
										"text"
									),
									custom_remote_identities: {
										fqdn_id: resolveFileToken(
											argv["custom-remote-identities-fqdn-id"] as
												| string
												| undefined,
											"custom-remote-identities-fqdn-id",
											"text"
										),
									},
									customer_endpoint: resolveFileToken(
										argv["customer-endpoint"] as string | undefined,
										"customer-endpoint",
										"text"
									),
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
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
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									psk: resolveFileToken(
										argv["psk"] as string | undefined,
										"psk",
										"text"
									),
									replay_protection: argv["replay-protection"],
								}),
					sensitiveBodyPaths: [["psk"]],
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
						`/accounts/${accountId}/magic/ipsec_tunnels/${encodeURIComponent(String(argv["ipsec-tunnel-id"]))}`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["automatic-return-routing"] !== undefined)
				setNestedValue(
					bodyData,
					["automatic_return_routing"],
					argv["automatic-return-routing"]
				);
			if (argv["bgp-customer-asn"] !== undefined)
				setNestedValue(
					bodyData,
					["bgp", "customer_asn"],
					argv["bgp-customer-asn"]
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
			if (argv["cloudflare-endpoint"] !== undefined)
				setNestedValue(
					bodyData,
					["cloudflare_endpoint"],
					resolveFileToken(
						argv["cloudflare-endpoint"] as string | undefined,
						"cloudflare-endpoint",
						"text"
					)
				);
			if (argv["custom-remote-identities-fqdn-id"] !== undefined)
				setNestedValue(
					bodyData,
					["custom_remote_identities", "fqdn_id"],
					resolveFileToken(
						argv["custom-remote-identities-fqdn-id"] as string | undefined,
						"custom-remote-identities-fqdn-id",
						"text"
					)
				);
			if (argv["customer-endpoint"] !== undefined)
				setNestedValue(
					bodyData,
					["customer_endpoint"],
					resolveFileToken(
						argv["customer-endpoint"] as string | undefined,
						"customer-endpoint",
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
			if (argv["name"] !== undefined)
				setNestedValue(
					bodyData,
					["name"],
					resolveFileToken(argv["name"] as string | undefined, "name", "text")
				);
			if (argv["psk"] !== undefined)
				setNestedValue(
					bodyData,
					["psk"],
					resolveFileToken(argv["psk"] as string | undefined, "psk", "text")
				);
			if (argv["replay-protection"] !== undefined)
				setNestedValue(
					bodyData,
					["replay_protection"],
					argv["replay-protection"]
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PUT",
					`/accounts/${accountId}/magic/ipsec_tunnels/${encodeURIComponent(String(argv["ipsec-tunnel-id"]))}`,
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
