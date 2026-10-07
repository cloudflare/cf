import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust devices profiles custom update <policy-id>\n\nUpdates a configured device settings profile."
		)
		.positional("policy-id", {
			type: "string",
			description: "Policy ID",
			demandOption: true,
		})
		.option("allow-mode-switch", {
			type: "boolean",
			description: "Whether to allow the user to switch WARP between modes.",
		})
		.option("allow-updates", {
			type: "boolean",
			description:
				"Whether to receive update notifications when a new version of the client is available.",
		})
		.option("allowed-to-leave", {
			type: "boolean",
			description: "Whether to allow devices to leave the organization.",
		})
		.option("auto-connect", {
			type: "number",
			description:
				"The amount of time in seconds to reconnect after having been disabled.",
		})
		.option("browser-extension-config-proxy-control", {
			type: "string",
			description: "Whether the user may disable the browser extension proxy.",
			choices: ["unlocked", "locked"],
		})
		.option("browser-extension-config-proxy-enabled", {
			type: "boolean",
			description: "Whether the browser extension proxy is active.",
		})
		.option("captive-portal", {
			type: "number",
			description:
				"Turn on the captive portal after the specified amount of time.",
		})
		.option("default", {
			type: "boolean",
			description:
				"Whether the policy is the account default. WARP group profiles cannot set this field.",
		})
		.option("description", {
			type: "string",
			description: "A description of the policy.",
		})
		.option("disable-auto-fallback", {
			type: "boolean",
			description:
				"If the `dns_server` field of a fallback domain is not present, the client will fall back to a best guess of the default/system DNS resolvers unless this policy option is set to `true`.",
		})
		.option("dns-search-suffixes", {
			type: "string",
			description:
				"List of DNS search suffixes to apply to clients. Suffixes are evaluated in order. Use an empty array to clear. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Whether the policy will be applied to matching devices.",
		})
		.option("exclude", {
			type: "string",
			description:
				"List of routes excluded in the WARP client's tunnel. Both 'exclude' and 'include' cannot be set in the same request. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("exclude-office-ips", {
			type: "boolean",
			description: "Whether to add Microsoft IPs to Split Tunnel exclusions.",
		})
		.option("global-acceleration-api-endpoints", {
			type: "string",
			array: true,
			description: "IP:port entries for the API endpoints.",
		})
		.option("global-acceleration-autoswitch", {
			type: "boolean",
			description:
				"Automatically switch Global Acceleration regions based on device location. Defaults to false when not provided.",
		})
		.option("global-acceleration-enabled", {
			type: "boolean",
			description: 'Global acceleration settings are used only when "enabled".',
		})
		.option("global-acceleration-masque-endpoints", {
			type: "string",
			array: true,
			description:
				"IP:port entries for the MASQUE tunnel endpoints. Either wireguard_endpoints or masque_endpoints must be provided.",
		})
		.option("global-acceleration-wireguard-endpoints", {
			type: "string",
			array: true,
			description:
				"IP:port entries for the WireGuard tunnel endpoints. Either wireguard_endpoints or masque_endpoints must be provided.",
		})
		.option("include", {
			type: "string",
			description:
				"List of routes included in the WARP client's tunnel. Both 'exclude' and 'include' cannot be set in the same request. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("lan-allow-minutes", {
			type: "number",
			description:
				"The amount of time in minutes a user is allowed access to their LAN. A value of 0 will allow LAN access until the next WARP reconnection, such as a reboot or a laptop waking from sleep. Note that this field is omitted from the response if null or unset.",
		})
		.option("lan-allow-subnet-size", {
			type: "number",
			description:
				"The size of the subnet for the local access network. Note that this field is omitted from the response if null or unset.",
		})
		.option("match", {
			type: "string",
			description:
				'The wirefilter expression to match devices. Available values: "identity.email", "identity.groups.id", "identity.groups.name", "identity.groups.email", "identity.service_token_uuid", "identity.saml_attributes", "network", "os.name", "os.version", "device.tags".',
		})
		.option("name", {
			type: "string",
			description: "The name of the device settings profile.",
		})
		.option("precedence", {
			type: "number",
			description:
				"The precedence of the policy. Lower values indicate higher precedence. Policies will be evaluated in ascending order of this field.",
		})
		.option("register-interface-ip-with-dns", {
			type: "boolean",
			description:
				"Determines if the operating system will register WARP's local interface IP with your on-premises DNS server.",
		})
		.option("sccm-vpn-boundary-support", {
			type: "boolean",
			description:
				"Determines whether the WARP client indicates to SCCM that it is inside a VPN boundary. (Windows only).",
		})
		.option("service-mode-v2-mode", {
			type: "string",
			description: "The mode to run the WARP client under.",
		})
		.option("service-mode-v2-port", {
			type: "number",
			description: "The port number when used with proxy mode.",
		})
		.option("support-url", {
			type: "string",
			description:
				"The URL to launch when the Send Feedback button is clicked.",
		})
		.option("switch-locked", {
			type: "boolean",
			description:
				"Whether to allow the user to turn off the WARP switch and disconnect the client.",
		})
		.option("tunnel-protocol", {
			type: "string",
			description: "Determines which tunnel protocol to use.",
		})
		.option("uninstall-protection", {
			type: "boolean",
			description:
				"Determines whether uninstalling the WARP client requires an override code. (Windows only).",
		})
		.option("virtual-networks-allowed", {
			type: "string",
			array: true,
			description:
				"List of virtual network IDs the device is allowed to access. When virtual_networks is set, at least one entry is required.",
		})
		.option("virtual-networks-default", {
			type: "string",
			description:
				"The default virtual network ID. Must be included in the `allowed` list.",
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
				"browser-extension-config-proxy-control",
				"browser-extension-config-proxy-enabled",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"browser-extension-config-proxy-control",
					"browser-extension-config-proxy-enabled",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --browser_extension_config-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"global-acceleration-api-endpoints",
				"global-acceleration-autoswitch",
				"global-acceleration-enabled",
				"global-acceleration-masque-endpoints",
				"global-acceleration-wireguard-endpoints",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"global-acceleration-api-endpoints",
					"global-acceleration-enabled",
					"global-acceleration-masque-endpoints",
					"global-acceleration-wireguard-endpoints",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --global_acceleration-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"virtual-networks-allowed",
				"virtual-networks-default",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"virtual-networks-allowed",
					"virtual-networks-default",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --virtual_networks-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"devices-update-device-settings-policy">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <policy-id>",
	describe: "Update a device settings profile",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust devices profiles custom update",
				classification: {
					safeFlags: [
						"allow-mode-switch",
						"allow-updates",
						"allowed-to-leave",
						"browser-extension-config-proxy-control",
						"browser-extension-config-proxy-enabled",
						"default",
						"disable-auto-fallback",
						"enabled",
						"exclude-office-ips",
						"global-acceleration-autoswitch",
						"global-acceleration-enabled",
						"register-interface-ip-with-dns",
						"sccm-vpn-boundary-support",
						"switch-locked",
						"uninstall-protection",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust devices profiles custom update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/policy/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allow_mode_switch: argv["allow-mode-switch"],
										allow_updates: argv["allow-updates"],
										allowed_to_leave: argv["allowed-to-leave"],
										auto_connect: argv["auto-connect"],
										browser_extension_config: {
											proxy_control: resolveFileToken(
												argv["browser-extension-config-proxy-control"] as
													| string
													| undefined,
												"browser-extension-config-proxy-control",
												"text"
											),
											proxy_enabled:
												argv["browser-extension-config-proxy-enabled"],
										},
										captive_portal: argv["captive-portal"],
										default: argv["default"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										disable_auto_fallback: argv["disable-auto-fallback"],
										dns_search_suffixes: parseObjectArray(
											argv["dns-search-suffixes"],
											"dns-search-suffixes"
										),
										enabled: argv["enabled"],
										exclude: parseObjectArray(argv["exclude"], "exclude"),
										exclude_office_ips: argv["exclude-office-ips"],
										global_acceleration: {
											api_endpoints: argv["global-acceleration-api-endpoints"],
											autoswitch: argv["global-acceleration-autoswitch"],
											enabled: argv["global-acceleration-enabled"],
											masque_endpoints:
												argv["global-acceleration-masque-endpoints"],
											wireguard_endpoints:
												argv["global-acceleration-wireguard-endpoints"],
										},
										include: parseObjectArray(argv["include"], "include"),
										lan_allow_minutes: argv["lan-allow-minutes"],
										lan_allow_subnet_size: argv["lan-allow-subnet-size"],
										match: resolveFileToken(
											argv["match"] as string | undefined,
											"match",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										precedence: argv["precedence"],
										register_interface_ip_with_dns:
											argv["register-interface-ip-with-dns"],
										sccm_vpn_boundary_support:
											argv["sccm-vpn-boundary-support"],
										service_mode_v2: {
											mode: resolveFileToken(
												argv["service-mode-v2-mode"] as string | undefined,
												"service-mode-v2-mode",
												"text"
											),
											port: argv["service-mode-v2-port"],
										},
										support_url: resolveFileToken(
											argv["support-url"] as string | undefined,
											"support-url",
											"text"
										),
										switch_locked: argv["switch-locked"],
										tunnel_protocol: resolveFileToken(
											argv["tunnel-protocol"] as string | undefined,
											"tunnel-protocol",
											"text"
										),
										uninstall_protection: argv["uninstall-protection"],
										virtual_networks: {
											allowed: argv["virtual-networks-allowed"],
											default: resolveFileToken(
												argv["virtual-networks-default"] as string | undefined,
												"virtual-networks-default",
												"text"
											),
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.devices.profiles.custom.update({
							...bodyData,
							account_id: accountId,
							policy_id: argv["policy-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					allow_mode_switch: argv["allow-mode-switch"],
					allow_updates: argv["allow-updates"],
					allowed_to_leave: argv["allowed-to-leave"],
					auto_connect: argv["auto-connect"],
					browser_extension_config: {
						proxy_control: resolveFileToken(
							argv["browser-extension-config-proxy-control"] as
								| string
								| undefined,
							"browser-extension-config-proxy-control",
							"text"
						),
						proxy_enabled: argv["browser-extension-config-proxy-enabled"],
					},
					captive_portal: argv["captive-portal"],
					default: argv["default"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					disable_auto_fallback: argv["disable-auto-fallback"],
					dns_search_suffixes: parseObjectArray(
						argv["dns-search-suffixes"],
						"dns-search-suffixes"
					),
					enabled: argv["enabled"],
					exclude: parseObjectArray(argv["exclude"], "exclude"),
					exclude_office_ips: argv["exclude-office-ips"],
					global_acceleration: {
						api_endpoints: argv["global-acceleration-api-endpoints"],
						autoswitch: argv["global-acceleration-autoswitch"],
						enabled: argv["global-acceleration-enabled"],
						masque_endpoints: argv["global-acceleration-masque-endpoints"],
						wireguard_endpoints:
							argv["global-acceleration-wireguard-endpoints"],
					},
					include: parseObjectArray(argv["include"], "include"),
					lan_allow_minutes: argv["lan-allow-minutes"],
					lan_allow_subnet_size: argv["lan-allow-subnet-size"],
					match: resolveFileToken(
						argv["match"] as string | undefined,
						"match",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					precedence: argv["precedence"],
					register_interface_ip_with_dns:
						argv["register-interface-ip-with-dns"],
					sccm_vpn_boundary_support: argv["sccm-vpn-boundary-support"],
					service_mode_v2: {
						mode: resolveFileToken(
							argv["service-mode-v2-mode"] as string | undefined,
							"service-mode-v2-mode",
							"text"
						),
						port: argv["service-mode-v2-port"],
					},
					support_url: resolveFileToken(
						argv["support-url"] as string | undefined,
						"support-url",
						"text"
					),
					switch_locked: argv["switch-locked"],
					tunnel_protocol: resolveFileToken(
						argv["tunnel-protocol"] as string | undefined,
						"tunnel-protocol",
						"text"
					),
					uninstall_protection: argv["uninstall-protection"],
					virtual_networks: {
						allowed: argv["virtual-networks-allowed"],
						default: resolveFileToken(
							argv["virtual-networks-default"] as string | undefined,
							"virtual-networks-default",
							"text"
						),
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.devices.profiles.custom.update({
						...bodyData,
						account_id: accountId,
						policy_id: argv["policy-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
