import operation from "../../../_operations/zero-trust/gateway/locations/update.js";
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
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <location-id>",
	describe: "Update a Zero Trust Gateway location",
	usage:
		"$0 zero-trust gateway locations update <location-id>\n\nUpdate a configured Zero Trust Gateway location.",
	flags: {
		"client-default": {
			kind: "boolean",
			brief: "Indicate whether this location is the default location.",
			optional: true,
		},
		"dns64-enabled": {
			kind: "boolean",
			brief:
				"Enable DNS64 synthesis for DNS queries matched to this location. When updating a location, omitting this field resets it to false.",
			optional: true,
		},
		"dns-destination-ips-id": {
			kind: "parsed",
			brief:
				"Specify the identifier of the pair of IPv4 addresses assigned to this location. When creating a location, if this field is absent or set to null, the pair of shared IPv4 addresses (0e4a32c6-6fb8-4858-9296-98f51631e8e6) is auto-assigned. When updating a location, if this field is absent or set to null, the pre-assigned pair remains unchanged.",
			optional: true,
			parse: String,
		},
		"ecs-support": {
			kind: "boolean",
			brief: "Indicate whether the location must resolve EDNS queries.",
			optional: true,
		},
		"endpoints-doh-enabled": {
			kind: "boolean",
			brief: "Indicate whether the DOH endpoint is enabled for this location.",
			optional: true,
		},
		"endpoints-doh-networks": {
			kind: "parsed",
			brief:
				'Specify the list of allowed source IP network ranges for this endpoint. When the list is empty, the endpoint allows all source IPs. The list takes effect only if the endpoint is enabled for this location. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"network": string}].',
			optional: true,
			parse: String,
		},
		"endpoints-doh-require-token": {
			kind: "boolean",
			brief:
				"Specify whether the DOH endpoint requires user identity authentication.",
			optional: true,
		},
		"endpoints-dot-enabled": {
			kind: "boolean",
			brief: "Indicate whether the DOT endpoint is enabled for this location.",
			optional: true,
		},
		"endpoints-dot-networks": {
			kind: "parsed",
			brief:
				'Specify the list of allowed source IP network ranges for this endpoint. When the list is empty, the endpoint allows all source IPs. The list takes effect only if the endpoint is enabled for this location. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"network": string}].',
			optional: true,
			parse: String,
		},
		"endpoints-ipv4-enabled": {
			kind: "boolean",
			brief: "Indicate whether the IPv4 endpoint is enabled for this location.",
			optional: true,
		},
		"endpoints-ipv6-enabled": {
			kind: "boolean",
			brief: "Indicate whether the IPV6 endpoint is enabled for this location.",
			optional: true,
		},
		"endpoints-ipv6-networks": {
			kind: "parsed",
			brief:
				'Specify the list of allowed source IPv6 network ranges for this endpoint. When the list is empty, the endpoint allows all source IPs. The list takes effect only if the endpoint is enabled for this location. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"network": string}].',
			optional: true,
			parse: String,
		},
		"max-ttl-mode": {
			kind: "parsed",
			brief:
				"`inherit` uses the account `max_ttl_secs`. `override` uses this location's `ttl_secs`. `disabled` leaves returned TTLs unchanged.",
			optional: true,
			choices: ["inherit", "override", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "max-ttl-mode", "text"),
		},
		"max-ttl-ttl-secs": {
			kind: "parsed",
			brief:
				"Location-specific cap on DNS response TTLs, in seconds. Required when `mode` is `override`. Must be omitted when `mode` is `inherit` or `disabled`.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "Specify the location name.",
			optional: true,
			parse: String,
		},
		networks: {
			kind: "parsed",
			brief:
				'Specify the list of network ranges from which requests at this location originate. The list takes effect only if it is non-empty and the IPv4 endpoint is enabled for this location. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"network": string}].',
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
		{ placeholder: "location-id", brief: "Location ID", parse: String },
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = ["max-ttl-mode", "max-ttl-ttl-secs"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["max-ttl-mode"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --max-ttl-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust gateway locations update",
				classification: {
					safeFlags: [
						"client-default",
						"dns64-enabled",
						"ecs-support",
						"endpoints-doh-enabled",
						"endpoints-doh-require-token",
						"endpoints-dot-enabled",
						"endpoints-ipv4-enabled",
						"endpoints-ipv6-enabled",
						"max-ttl-mode",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Specify the location name."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust gateway locations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/locations/${argv["location-id"] == null ? "<location-id>" : encodeURIComponent(String(argv["location-id"]))}`,
						pathParams: { "location-id": String(argv["location-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										client_default: argv["client-default"],
										dns64_enabled: argv["dns64-enabled"],
										dns_destination_ips_id: resolveFileToken(
											argv["dns-destination-ips-id"] as string | undefined,
											"dns-destination-ips-id",
											"text"
										),
										ecs_support: argv["ecs-support"],
										endpoints: {
											doh: {
												enabled: argv["endpoints-doh-enabled"],
												networks: parseObjectArray(
													argv["endpoints-doh-networks"],
													"endpoints-doh-networks",
													true
												),
												require_token: argv["endpoints-doh-require-token"],
											},
											dot: {
												enabled: argv["endpoints-dot-enabled"],
												networks: parseObjectArray(
													argv["endpoints-dot-networks"],
													"endpoints-dot-networks",
													true
												),
											},
											ipv4: {
												enabled: argv["endpoints-ipv4-enabled"],
											},
											ipv6: {
												enabled: argv["endpoints-ipv6-enabled"],
												networks: parseObjectArray(
													argv["endpoints-ipv6-networks"],
													"endpoints-ipv6-networks",
													true
												),
											},
										},
										max_ttl: {
											mode: argv["max-ttl-mode"],
											ttl_secs: argv["max-ttl-ttl-secs"],
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										networks: parseObjectArray(
											argv["networks"],
											"networks",
											true
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							location_id: argv["location-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					client_default: argv["client-default"],
					dns64_enabled: argv["dns64-enabled"],
					dns_destination_ips_id: resolveFileToken(
						argv["dns-destination-ips-id"] as string | undefined,
						"dns-destination-ips-id",
						"text"
					),
					ecs_support: argv["ecs-support"],
					endpoints: {
						doh: {
							enabled: argv["endpoints-doh-enabled"],
							networks: parseObjectArray(
								argv["endpoints-doh-networks"],
								"endpoints-doh-networks",
								true
							),
							require_token: argv["endpoints-doh-require-token"],
						},
						dot: {
							enabled: argv["endpoints-dot-enabled"],
							networks: parseObjectArray(
								argv["endpoints-dot-networks"],
								"endpoints-dot-networks",
								true
							),
						},
						ipv4: {
							enabled: argv["endpoints-ipv4-enabled"],
						},
						ipv6: {
							enabled: argv["endpoints-ipv6-enabled"],
							networks: parseObjectArray(
								argv["endpoints-ipv6-networks"],
								"endpoints-ipv6-networks",
								true
							),
						},
					},
					max_ttl: {
						mode: argv["max-ttl-mode"],
						ttl_secs: argv["max-ttl-ttl-secs"],
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					networks: parseObjectArray(argv["networks"], "networks", true),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						location_id: argv["location-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
