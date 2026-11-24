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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <cf-interconnect-id>",
	describe: "Update interconnect",
	usage:
		"$0 magic-transit cf-interconnects update <cf-interconnect-id>\n\nUpdates a specific interconnect associated with an account. Use `?validate_only=true` as an optional query parameter to only run validation without persisting changes.",
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
		"bgp-as-no": {
			kind: "parsed",
			brief: "Deprecated. Use customer_asn.",
			optional: true,
			parse: Number,
		},
		"bgp-cloudflare-endpoint": {
			kind: "parsed",
			brief: "Read-only for v1.5; derived from interface_address.",
			optional: true,
			parse: String,
		},
		"bgp-customer-asn": {
			kind: "parsed",
			brief: "ASN used on the customer end of the BGP session.",
			optional: true,
			parse: Number,
		},
		"bgp-customer-endpoint": {
			kind: "parsed",
			brief: "Read-only for v1.5; derived from interface_address.",
			optional: true,
			parse: String,
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
				"IPv4 prefixes in this list will be advertised to the customer device, in addition to the routes in the Magic\nrouting table. Each entry must be a network address in CIDR notation with no host bits set (for example\n`192.0.2.0/24`, not `192.0.2.1/24`) and must not repeat another entry.\n",
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
		description: {
			kind: "parsed",
			brief: "An optional description of the interconnect.",
			optional: true,
			parse: String,
		},
		"gre-cloudflare-endpoint": {
			kind: "parsed",
			brief:
				"The IP address assigned to the Cloudflare side of the GRE tunnel created as part of the Interconnect.",
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
				"The direction of the flow of the healthcheck. Either unidirectional, where the probe comes to you via the interconnect and the result comes back to Cloudflare via the open Internet, or bidirectional where both the probe and result come and go via the interconnect.",
			optional: true,
			choices: ["unidirectional", "bidirectional"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-direction", "text"),
		},
		"health-check-source": {
			kind: "parsed",
			brief:
				"The source IPv4 address used for bidirectional health checks. Supported only for version 1.5 interconnects. It is required when `direction` is `bidirectional` and must be omitted (and is cleared) when `direction` is `unidirectional`. The address must be within RFC1918 space, the approved link-local range 169.254.240.0/20, or the Cloudflare reserved range 198.41.199.224/27.",
			optional: true,
			parse: String,
		},
		"interface-address": {
			kind: "parsed",
			brief:
				"The IPv4 interface address for the interconnect. For MPLS Interconnects,\nuse a /30 or /31 prefix. For GRE Interconnects, a /30 or /31 prefix\nmay be used. Version 1.5 interconnects require a /31 prefix and may\nalso use a prefix from the account's authorized prefixes; otherwise,\nselect the subnet from RFC 1918 or the approved link-local ranges.\n",
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
		mtu: {
			kind: "parsed",
			brief:
				"The Maximum Transmission Unit (MTU) in bytes for the interconnect. The minimum value is 576.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the interconnect. The name cannot share a name with other tunnels.",
			optional: true,
			parse: String,
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
		{ placeholder: "cf-interconnect-id", brief: "Identifier", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
													argv["health-check-target-saved"] as
														| string
														| undefined,
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
		),
});

export default command;
