import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit gre-tunnels create\n\nCreates a new GRE tunnel. Use `?validate_only=true` as an optional query parameter to only run validation without persisting changes."
		)
		.option("x-magic-new-hc-target", {
			type: "string",
			description:
				"If true, the health check target in the request and response bodies will be presented using the new object format. Defaults to false.",
		})
		.option("automatic-return-routing", {
			type: "boolean",
			description:
				"True if automatic stateful return routing should be enabled for a tunnel, false otherwise. Requires the `coupler_integration` account flag to be enabled; requests setting this to `true` without that flag will be rejected.",
			default: false,
		})
		.option("bgp-customer-asn", {
			type: "number",
			description: "ASN used on the customer end of the BGP session",
		})
		.option("bgp-export-filter-id", {
			type: "string",
			description:
				"ID of the BGP filter profile applied to routes advertised to the customer.",
		})
		.option("bgp-extra-prefixes", {
			type: "string",
			array: true,
			description:
				"Prefixes in this list will be advertised to the customer device, in addition to the routes in the Magic routing table.",
		})
		.option("bgp-import-filter-id", {
			type: "string",
			description:
				"ID of the BGP filter profile applied to routes received from the customer.",
		})
		.option("bgp-md5-key", {
			type: "string",
			description:
				"MD5 key to use for session authentication.\n\nNote that *this is not a security measure*. MD5 is not a valid security mechanism, and the\nkey is not treated as a secret value. This is *only* supported for preventing\nmisconfiguration, not for defending against malicious attacks.\n\nThe MD5 key, if set, must be of non-zero length and consist only of the following types of\ncharacter:\n\n* ASCII alphanumerics: `[a-zA-Z0-9]`\n* Special characters in the set `'!@#$%^&*()+[]{}<>/.,;:_-~`= \\|`\n\nIn other words, MD5 keys may contain any printable ASCII character aside from newline (0x0A),\nquotation mark (`\"`), vertical tab (0x0B), carriage return (0x0D), tab (0x09), form feed\n(0x0C), and the question mark (`?`). Requests specifying an MD5 key with one or more of\nthese disallowed characters will be rejected.",
		})
		.option("cloudflare-gre-endpoint", {
			type: "string",
			description:
				"The IP address assigned to the Cloudflare side of the GRE tunnel.",
		})
		.option("customer-gre-endpoint", {
			type: "string",
			description:
				"The IP address assigned to the customer side of the GRE tunnel.",
		})
		.option("description", {
			type: "string",
			description: "An optional description of the GRE tunnel.",
		})
		.option("health-check-enabled", {
			type: "boolean",
			description: "Determines whether to run healthchecks for a tunnel.",
		})
		.option("health-check-rate", {
			type: "string",
			description:
				"How frequent the health check is run. The default value is `mid`.",
			choices: ["low", "mid", "high"],
		})
		.option("health-check-target-saved", {
			type: "string",
			description:
				"The saved health check target. Setting the value to the empty string indicates that the calculated default value will be used.",
		})
		.option("health-check-type", {
			type: "string",
			description:
				"The type of healthcheck to run, reply or request. The default value is `reply`.",
			choices: ["reply", "request"],
		})
		.option("health-check-direction", {
			type: "string",
			description:
				"The direction of the flow of the healthcheck. Either unidirectional, where the probe comes to you via the tunnel and the result comes back to Cloudflare via the open Internet, or bidirectional where both the probe and result come and go via the tunnel.",
			choices: ["unidirectional", "bidirectional"],
		})
		.option("interface-address", {
			type: "string",
			description:
				"A 31-bit prefix (/31 in CIDR notation) supporting two hosts, one for each side of the tunnel. Select the subnet from the following private IP space: 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255, 192.168.0.0–192.168.255.255.",
		})
		.option("interface-address6", {
			type: "string",
			description:
				"A 127 bit IPV6 prefix from within the virtual_subnet6 prefix space with the address being the first IP of the subnet and not same as the address of virtual_subnet6. Eg if virtual_subnet6 is 2606:54c1:7:0:a9fe:12d2::/127 , interface_address6 could be 2606:54c1:7:0:a9fe:12d2:1:200/127",
		})
		.option("mtu", {
			type: "number",
			description:
				"Maximum Transmission Unit (MTU) in bytes for the GRE tunnel. The minimum value is 576.",
			default: 1476,
		})
		.option("name", {
			type: "string",
			description:
				"The name of the tunnel. The name cannot contain spaces or special characters, must be 15 characters or less, and cannot share a name with another GRE tunnel.",
		})
		.option("ttl", {
			type: "number",
			description: "Time To Live (TTL) in number of hops of the GRE tunnel.",
			default: 64,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"bgp-customer-asn",
				"bgp-export-filter-id",
				"bgp-extra-prefixes",
				"bgp-import-filter-id",
				"bgp-md5-key",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
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
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a GRE tunnel",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit gre-tunnels create",
				classification: {
					safeFlags: [
						"automatic-return-routing",
						"health-check-enabled",
						"health-check-rate",
						"health-check-type",
						"health-check-direction",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
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
						command: "cf magic-transit gre-tunnels create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/gre_tunnels`,
						pathParams: {},
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
										cloudflare_gre_endpoint: resolveFileToken(
											argv["cloudflare-gre-endpoint"] as string | undefined,
											"cloudflare-gre-endpoint",
											"text"
										),
										customer_gre_endpoint: resolveFileToken(
											argv["customer-gre-endpoint"] as string | undefined,
											"customer-gre-endpoint",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										health_check: {
											enabled: argv["health-check-enabled"],
											rate: resolveFileToken(
												argv["health-check-rate"] as string | undefined,
												"health-check-rate",
												"text"
											),
											target: {
												saved: resolveFileToken(
													argv["health-check-target-saved"] as
														| string
														| undefined,
													"health-check-target-saved",
													"text"
												),
											},
											type: resolveFileToken(
												argv["health-check-type"] as string | undefined,
												"health-check-type",
												"text"
											),
											direction: resolveFileToken(
												argv["health-check-direction"] as string | undefined,
												"health-check-direction",
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
										ttl: argv["ttl"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/magic/gre_tunnels`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["cloudflare-gre-endpoint"] === undefined) {
					argv["cloudflare-gre-endpoint"] = await promptForRequiredField(
						"cloudflare-gre-endpoint",
						"The IP address assigned to the Cloudflare side of the GRE tunnel."
					);
				}
				if (argv["customer-gre-endpoint"] === undefined) {
					argv["customer-gre-endpoint"] = await promptForRequiredField(
						"customer-gre-endpoint",
						"The IP address assigned to the customer side of the GRE tunnel."
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
						"The name of the tunnel. The name cannot contain spaces or special characters, must be 15 characters or less, and cannot share a name with another GRE tunnel."
					);
				}

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
				if (argv["cloudflare-gre-endpoint"] !== undefined)
					setNestedValue(
						bodyData,
						["cloudflare_gre_endpoint"],
						resolveFileToken(
							argv["cloudflare-gre-endpoint"] as string | undefined,
							"cloudflare-gre-endpoint",
							"text"
						)
					);
				if (argv["customer-gre-endpoint"] !== undefined)
					setNestedValue(
						bodyData,
						["customer_gre_endpoint"],
						resolveFileToken(
							argv["customer-gre-endpoint"] as string | undefined,
							"customer-gre-endpoint",
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
						resolveFileToken(
							argv["health-check-rate"] as string | undefined,
							"health-check-rate",
							"text"
						)
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
						resolveFileToken(
							argv["health-check-type"] as string | undefined,
							"health-check-type",
							"text"
						)
					);
				if (argv["health-check-direction"] !== undefined)
					setNestedValue(
						bodyData,
						["health_check", "direction"],
						resolveFileToken(
							argv["health-check-direction"] as string | undefined,
							"health-check-direction",
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
				if (argv["ttl"] !== undefined)
					setNestedValue(bodyData, ["ttl"], argv["ttl"]);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/magic/gre_tunnels`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
