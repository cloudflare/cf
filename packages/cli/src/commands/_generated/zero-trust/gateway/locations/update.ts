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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust gateway locations update <location-id>\n\nUpdate a configured Zero Trust Gateway location."
		)
		.positional("location-id", {
			type: "string",
			description: "Location ID",
			demandOption: true,
		})
		.option("client-default", {
			type: "boolean",
			description: "Indicate whether this location is the default location.",
		})
		.option("dns-destination-ips-id", {
			type: "string",
			description:
				"Specify the identifier of the pair of IPv4 addresses assigned to this location. When creating a location, if this field is absent or set to null, the pair of shared IPv4 addresses (0e4a32c6-6fb8-4858-9296-98f51631e8e6) is auto-assigned. When updating a location, if this field is absent or set to null, the pre-assigned pair remains unchanged.",
		})
		.option("ecs-support", {
			type: "boolean",
			description: "Indicate whether the location must resolve EDNS queries.",
		})
		.option("endpoints-doh-enabled", {
			type: "boolean",
			description:
				"Indicate whether the DOH endpoint is enabled for this location.",
		})
		.option("endpoints-doh-require-token", {
			type: "boolean",
			description:
				"Specify whether the DOH endpoint requires user identity authentication.",
		})
		.option("endpoints-dot-enabled", {
			type: "boolean",
			description:
				"Indicate whether the DOT endpoint is enabled for this location.",
		})
		.option("endpoints-ipv4-enabled", {
			type: "boolean",
			description:
				"Indicate whether the IPv4 endpoint is enabled for this location.",
		})
		.option("endpoints-ipv6-enabled", {
			type: "boolean",
			description:
				"Indicate whether the IPV6 endpoint is enabled for this location.",
		})
		.option("max-ttl-mode", {
			type: "string",
			description:
				"`inherit` uses the account `max_ttl_secs`. `override` uses this location's `ttl_secs`. `disabled` leaves returned TTLs unchanged.",
			choices: ["inherit", "override", "disabled"],
		})
		.coerce("max-ttl-mode", (value: string | undefined) =>
			resolveFileToken(value, "max-ttl-mode", "text")
		)
		.option("max-ttl-ttl-secs", {
			type: "number",
			description:
				"Location-specific cap on DNS response TTLs, in seconds. Required when `mode` is `override`. Must be omitted when `mode` is `inherit` or `disabled`.",
		})
		.option("name", {
			type: "string",
			description: "Specify the location name.",
		})
		.option("networks", {
			type: "string",
			description:
				"Specify the list of network ranges from which requests at this location originate. The list takes effect only if it is non-empty and the IPv4 endpoint is enabled for this location. Provide as a JSON array of objects or @path/to/file.json.",
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
			const groupSet = ["max-ttl-mode", "max-ttl-ttl-secs"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["max-ttl-mode"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --max_ttl-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"zero-trust-gateway-locations-update-zero-trust-gateway-location">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <location-id>",
	describe: "Update a Zero Trust Gateway location",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust gateway locations update",
				classification: {
					safeFlags: [
						"client-default",
						"ecs-support",
						"endpoints-doh-enabled",
						"endpoints-doh-require-token",
						"endpoints-dot-enabled",
						"endpoints-ipv4-enabled",
						"endpoints-ipv6-enabled",
						"max-ttl-mode",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
										dns_destination_ips_id: resolveFileToken(
											argv["dns-destination-ips-id"] as string | undefined,
											"dns-destination-ips-id",
											"text"
										),
										ecs_support: argv["ecs-support"],
										endpoints: {
											doh: {
												enabled: argv["endpoints-doh-enabled"],
												require_token: argv["endpoints-doh-require-token"],
											},
											dot: {
												enabled: argv["endpoints-dot-enabled"],
											},
											ipv4: {
												enabled: argv["endpoints-ipv4-enabled"],
											},
											ipv6: {
												enabled: argv["endpoints-ipv6-enabled"],
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
										networks: parseObjectArray(argv["networks"], "networks"),
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
						client.zeroTrust.gateway.locations.update({
							...bodyData,
							account_id: accountId,
							location_id: argv["location-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Specify the location name."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					client_default: argv["client-default"],
					dns_destination_ips_id: resolveFileToken(
						argv["dns-destination-ips-id"] as string | undefined,
						"dns-destination-ips-id",
						"text"
					),
					ecs_support: argv["ecs-support"],
					endpoints: {
						doh: {
							enabled: argv["endpoints-doh-enabled"],
							require_token: argv["endpoints-doh-require-token"],
						},
						dot: {
							enabled: argv["endpoints-dot-enabled"],
						},
						ipv4: {
							enabled: argv["endpoints-ipv4-enabled"],
						},
						ipv6: {
							enabled: argv["endpoints-ipv6-enabled"],
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
					networks: parseObjectArray(argv["networks"], "networks"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.gateway.locations.update({
						...bodyData,
						account_id: accountId,
						location_id: argv["location-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
