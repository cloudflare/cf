import operation from "../../../_operations/zero-trust/devices/settings/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
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
	command: "update",
	describe: "Update device settings",
	usage:
		"$0 zero-trust devices settings update\n\nUpdates the device settings for a Zero Trust account.",
	flags: {
		"disable-for-time": {
			kind: "parsed",
			brief:
				"Sets the time limit, in seconds, that a user can use an override code to bypass WARP.",
			optional: true,
			parse: Number,
		},
		"external-emergency-signal-enabled": {
			kind: "boolean",
			brief:
				"Controls whether the external emergency disconnect feature is enabled.",
			optional: true,
		},
		"external-emergency-signal-fingerprint": {
			kind: "parsed",
			brief:
				"The SHA256 fingerprint (64 hexadecimal characters) of the HTTPS server certificate for the external_emergency_signal_url. If provided, the WARP client will use this value to verify the server's identity. The device will ignore any response if the server's certificate fingerprint does not exactly match this value.",
			optional: true,
			parse: String,
		},
		"external-emergency-signal-interval": {
			kind: "parsed",
			brief:
				'The interval at which the WARP client fetches the emergency disconnect signal, formatted as a duration string (e.g., "5m", "2m30s", "1h"). Minimum 30 seconds.',
			optional: true,
			parse: String,
		},
		"external-emergency-signal-url": {
			kind: "parsed",
			brief:
				"The HTTPS URL from which to fetch the emergency disconnect signal. Must use HTTPS and have an IPv4 or IPv6 address as the host.",
			optional: true,
			parse: String,
		},
		"gateway-proxy-enabled": {
			kind: "boolean",
			brief: "Enable gateway proxy filtering on TCP.",
			optional: true,
		},
		"gateway-udp-proxy-enabled": {
			kind: "boolean",
			brief: "Enable gateway proxy filtering on UDP.",
			optional: true,
		},
		"root-certificate-installation-enabled": {
			kind: "boolean",
			brief: "Enable installation of cloudflare managed root certificate.",
			optional: true,
		},
		"use-zt-virtual-ip": {
			kind: "boolean",
			brief: "Enable using CGNAT virtual IPv4.",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust devices settings update",
				classification: {
					safeFlags: [
						"external-emergency-signal-enabled",
						"gateway-proxy-enabled",
						"gateway-udp-proxy-enabled",
						"root-certificate-installation-enabled",
						"use-zt-virtual-ip",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust devices settings update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/settings`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										disable_for_time: argv["disable-for-time"],
										external_emergency_signal_enabled:
											argv["external-emergency-signal-enabled"],
										external_emergency_signal_fingerprint: resolveFileToken(
											argv["external-emergency-signal-fingerprint"] as
												| string
												| undefined,
											"external-emergency-signal-fingerprint",
											"text"
										),
										external_emergency_signal_interval: resolveFileToken(
											argv["external-emergency-signal-interval"] as
												| string
												| undefined,
											"external-emergency-signal-interval",
											"text"
										),
										external_emergency_signal_url: resolveFileToken(
											argv["external-emergency-signal-url"] as
												| string
												| undefined,
											"external-emergency-signal-url",
											"text"
										),
										gateway_proxy_enabled: argv["gateway-proxy-enabled"],
										gateway_udp_proxy_enabled:
											argv["gateway-udp-proxy-enabled"],
										root_certificate_installation_enabled:
											argv["root-certificate-installation-enabled"],
										use_zt_virtual_ip: argv["use-zt-virtual-ip"],
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					disable_for_time: argv["disable-for-time"],
					external_emergency_signal_enabled:
						argv["external-emergency-signal-enabled"],
					external_emergency_signal_fingerprint: resolveFileToken(
						argv["external-emergency-signal-fingerprint"] as string | undefined,
						"external-emergency-signal-fingerprint",
						"text"
					),
					external_emergency_signal_interval: resolveFileToken(
						argv["external-emergency-signal-interval"] as string | undefined,
						"external-emergency-signal-interval",
						"text"
					),
					external_emergency_signal_url: resolveFileToken(
						argv["external-emergency-signal-url"] as string | undefined,
						"external-emergency-signal-url",
						"text"
					),
					gateway_proxy_enabled: argv["gateway-proxy-enabled"],
					gateway_udp_proxy_enabled: argv["gateway-udp-proxy-enabled"],
					root_certificate_installation_enabled:
						argv["root-certificate-installation-enabled"],
					use_zt_virtual_ip: argv["use-zt-virtual-ip"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
