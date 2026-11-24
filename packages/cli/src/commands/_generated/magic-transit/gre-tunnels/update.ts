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
	command: "update <gre-tunnel-id>",
	describe: "Update GRE Tunnel",
	usage:
		"$0 magic-transit gre-tunnels update <gre-tunnel-id>\n\nUpdates a specific GRE tunnel. Use `?validate_only=true` as an optional query parameter to only run validation without persisting changes.",
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
		"cloudflare-gre-endpoint": {
			kind: "parsed",
			brief:
				"The IP address assigned to the Cloudflare side of the GRE tunnel.",
			optional: true,
			parse: String,
		},
		"customer-gre-endpoint": {
			kind: "parsed",
			brief: "The IP address assigned to the customer side of the GRE tunnel.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "An optional description of the GRE tunnel.",
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
		mtu: {
			kind: "parsed",
			brief:
				"Maximum Transmission Unit (MTU) in bytes for the GRE tunnel. The minimum value is 576.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the tunnel. The name cannot contain spaces or special characters, must be 15 characters or less, and cannot share a name with another GRE tunnel.",
			optional: true,
			parse: String,
		},
		ttl: {
			kind: "parsed",
			brief: "Time To Live (TTL) in number of hops of the GRE tunnel.",
			optional: true,
			parse: Number,
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
		{ placeholder: "gre-tunnel-id", brief: "Identifier", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit gre-tunnels update",
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
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit gre-tunnels update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/gre_tunnels/${argv["gre-tunnel-id"] == null ? "<gre-tunnel-id>" : encodeURIComponent(String(argv["gre-tunnel-id"]))}`,
						pathParams: {
							"gre-tunnel-id": String(argv["gre-tunnel-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										automatic_return_routing: argv["automatic-return-routing"],
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
							`/accounts/${accountId}/magic/gre_tunnels/${encodeURIComponent(String(argv["gre-tunnel-id"]))}`,
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
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/magic/gre_tunnels/${encodeURIComponent(String(argv["gre-tunnel-id"]))}`,
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
