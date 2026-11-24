/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "update <ipsec-tunnel-id>",
	describe: "Update IPsec Tunnel",
	usage:
		"$0 magic-transit ipsec-tunnels update <ipsec-tunnel-id>\n\nUpdates a specific IPsec tunnel associated with an account. Use `?validate_only=true` as an optional query parameter to only run validation without persisting changes.",
	flags: {
		"x-magic-new-hc-target": {
			kind: "parsed",
			brief:
				"If true, the health check target in the request and response bodies will be presented using the new object format. Defaults to false.",
			optional: true,
			parse: String,
		},
		"automatic-return-routing": {
			kind: "boolean",
			brief:
				"True if automatic stateful return routing should be enabled for a tunnel, false otherwise. Requires the `coupler_integration` account flag to be enabled; requests setting this to `true` without that flag will be rejected.",
			optional: true,
		},
		"bgp-customer-asn": {
			kind: "parsed",
			brief: "ASN used on the customer end of the BGP session",
			optional: true,
			parse: Number,
		},
		"bgp-export-filter-id": {
			kind: "parsed",
			brief:
				"ID of the BGP filter profile applied to routes advertised to the customer.",
			optional: true,
			parse: String,
		},
		"bgp-extra-prefixes": {
			kind: "parsed",
			brief:
				"Prefixes in this list will be advertised to the customer device, in addition to the routes in the Magic routing table.\nEach entry must be a network address in CIDR notation with no host bits set (for example `192.0.2.0/24`, not\n`192.0.2.1/24`) and must not repeat another entry. IPv6 prefixes are accepted only when the tunnel has an\n`interface_address6`.\n",
			variadic: true,
			optional: true,
			parse: String,
		},
		"bgp-import-filter-id": {
			kind: "parsed",
			brief:
				"ID of the BGP filter profile applied to routes received from the customer.",
			optional: true,
			parse: String,
		},
		"bgp-md5-key": {
			kind: "parsed",
			brief:
				"MD5 key to use for session authentication.\n\nNote that *this is not a security measure*. MD5 is not a valid security mechanism, and the\nkey is not treated as a secret value. This is *only* supported for preventing\nmisconfiguration, not for defending against malicious attacks.\n\nThe MD5 key, if set, must be of non-zero length and consist only of the following types of\ncharacter:\n\n* ASCII alphanumerics: `[a-zA-Z0-9]`\n* Special characters in the set `'!@#$%^&*()+[]{}<>/.,;:_-~`= \\|`\n\nIn other words, MD5 keys may contain any printable ASCII character aside from newline (0x0A),\nquotation mark (`\"`), vertical tab (0x0B), carriage return (0x0D), tab (0x09), form feed\n(0x0C), and the question mark (`?`). Requests specifying an MD5 key with one or more of\nthese disallowed characters will be rejected.",
			optional: true,
			parse: String,
		},
		"cloudflare-endpoint": {
			kind: "parsed",
			brief:
				"The IP address assigned to the Cloudflare side of the IPsec tunnel.",
			optional: true,
			parse: String,
		},
		"custom-remote-identities-fqdn-id": {
			kind: "parsed",
			brief:
				"A custom IKE ID of type FQDN that may be used to identity the IPsec tunnel. The\ngenerated IKE IDs can still be used even if this custom value is specified.\n\nMust be of the form `<custom label>.<account ID>.custom.ipsec.cloudflare.com`.\n\nThis custom ID does not need to be unique. Two IPsec tunnels may have the same custom\nfqdn_id. However, if another IPsec tunnel has the same value then the two tunnels\ncannot have the same cloudflare_endpoint.",
			optional: true,
			parse: String,
		},
		"customer-endpoint": {
			kind: "parsed",
			brief:
				"The IP address assigned to the customer side of the IPsec tunnel. Not required, but must be set for proactive traceroutes to work.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "An optional description forthe IPsec tunnel.",
			optional: true,
			parse: String,
		},
		"health-check-enabled": {
			kind: "boolean",
			brief: "Determines whether to run healthchecks for a tunnel.",
			optional: true,
		},
		"health-check-rate": {
			kind: "parsed",
			brief:
				"How frequent the health check is run. The default value is `mid`.",
			optional: true,
			choices: ["low", "mid", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-rate", "text"),
		},
		"health-check-target-saved": {
			kind: "parsed",
			brief:
				"The saved health check target. Setting the value to the empty string indicates that the calculated default value will be used.",
			optional: true,
			parse: String,
		},
		"health-check-type": {
			kind: "parsed",
			brief:
				"The type of healthcheck to run, reply or request. The default value is `reply`.",
			optional: true,
			choices: ["reply", "request"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-type", "text"),
		},
		"health-check-direction": {
			kind: "parsed",
			brief:
				"The direction of the flow of the healthcheck. Either unidirectional, where the probe comes to you via the tunnel and the result comes back to Cloudflare via the open Internet, or bidirectional where both the probe and result come and go via the tunnel.",
			optional: true,
			choices: ["unidirectional", "bidirectional"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-direction", "text"),
		},
		"interface-address": {
			kind: "parsed",
			brief:
				"A 31-bit prefix (/31 in CIDR notation) supporting two hosts, one for each side of the tunnel. Select the subnet from the following private IP space: 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255, 192.168.0.0–192.168.255.255.",
			optional: true,
			parse: String,
		},
		"interface-address6": {
			kind: "parsed",
			brief:
				"A 127 bit IPV6 prefix from within the virtual_subnet6 prefix space with the address being the first IP of the subnet and not same as the address of virtual_subnet6. Eg if virtual_subnet6 is 2606:54c1:7:0:a9fe:12d2::/127 , interface_address6 could be 2606:54c1:7:0:a9fe:12d2:1:200/127",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the IPsec tunnel. The name cannot share a name with other tunnels.",
			optional: true,
			parse: String,
		},
		psk: {
			kind: "parsed",
			brief:
				"A randomly generated or provided string for use in the IPsec tunnel.",
			optional: true,
			parse: String,
		},
		"replay-protection": {
			kind: "boolean",
			brief:
				"If `true`, then IPsec replay protection will be supported in the Cloudflare-to-customer direction.",
			optional: true,
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
	operands: [
		{ placeholder: "ipsec-tunnel-id", brief: "Identifier", parse: String },
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"bgp-customer-asn",
				"bgp-export-filter-id",
				"bgp-extra-prefixes",
				"bgp-import-filter-id",
				"bgp-md5-key",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["bgp-customer-asn"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --bgp-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
													argv["health-check-target-saved"] as
														| string
														| undefined,
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
		),
});

export default command;
