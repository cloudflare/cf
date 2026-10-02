import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
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
			"$0 magic-transit sites lans update <lan-id>\n\nUpdate a specific Site LAN."
		)
		.positional("lan-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("site-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("bond-id", { type: "number", description: "The bond_id field" })
		.option("ha-link", {
			type: "boolean",
			description:
				"mark true to use this LAN for HA probing. only works for site with HA turned on. only one LAN can be set as the ha_link.",
		})
		.option("is-breakout", {
			type: "boolean",
			description:
				"mark true to use this LAN for source-based breakout traffic",
		})
		.option("is-prioritized", {
			type: "boolean",
			description:
				"mark true to use this LAN for source-based prioritized traffic",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("nat-static-prefix", {
			type: "string",
			description: "A valid CIDR notation representing an IP range.",
		})
		.option("physport", { type: "number", description: "The physport field" })
		.option("routed-subnets", {
			type: "string",
			description:
				"The routed_subnets field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("static-addressing-address", {
			type: "string",
			description: "A valid CIDR notation representing an IP range.",
		})
		.option("static-addressing-dhcp-relay-server-addresses", {
			type: "string",
			array: true,
			description: "List of DHCP server IPs.",
		})
		.option("static-addressing-dhcp-server-dhcp-pool-end", {
			type: "string",
			description: "A valid IPv4 address.",
		})
		.option("static-addressing-dhcp-server-dhcp-pool-start", {
			type: "string",
			description: "A valid IPv4 address.",
		})
		.option("static-addressing-dhcp-server-dns-servers", {
			type: "string",
			array: true,
			description: "The static_addressing.dhcp_server.dns_servers field",
		})
		.option("static-addressing-secondary-address", {
			type: "string",
			description: "A valid CIDR notation representing an IP range.",
		})
		.option("static-addressing-virtual-address", {
			type: "string",
			description: "A valid CIDR notation representing an IP range.",
		})
		.option("vlan-tag", {
			type: "number",
			description: "VLAN ID. Use zero for untagged.",
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
				"static-addressing-address",
				"static-addressing-dhcp-relay-server-addresses",
				"static-addressing-dhcp-server-dhcp-pool-end",
				"static-addressing-dhcp-server-dhcp-pool-start",
				"static-addressing-dhcp-server-dns-servers",
				"static-addressing-secondary-address",
				"static-addressing-virtual-address",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["static-addressing-address"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --static_addressing-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"magic-site-lans-update-lan">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <lan-id>",
	describe: "Update Site LAN",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites lans update",
				classification: {
					safeFlags: ["ha-link", "is-breakout", "is-prioritized", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit sites lans update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}/lans/${argv["lan-id"] == null ? "<lan-id>" : encodeURIComponent(String(argv["lan-id"]))}`,
						pathParams: {
							"site-id": String(argv["site-id"] ?? ""),
							"lan-id": String(argv["lan-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										bond_id: argv["bond-id"],
										ha_link: argv["ha-link"],
										is_breakout: argv["is-breakout"],
										is_prioritized: argv["is-prioritized"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										nat: {
											static_prefix: resolveFileToken(
												argv["nat-static-prefix"] as string | undefined,
												"nat-static-prefix",
												"text"
											),
										},
										physport: argv["physport"],
										routed_subnets: parseObjectArray(
											argv["routed-subnets"],
											"routed-subnets"
										),
										static_addressing: {
											address: resolveFileToken(
												argv["static-addressing-address"] as string | undefined,
												"static-addressing-address",
												"text"
											),
											dhcp_relay: {
												server_addresses:
													argv["static-addressing-dhcp-relay-server-addresses"],
											},
											dhcp_server: {
												dhcp_pool_end: resolveFileToken(
													argv[
														"static-addressing-dhcp-server-dhcp-pool-end"
													] as string | undefined,
													"static-addressing-dhcp-server-dhcp-pool-end",
													"text"
												),
												dhcp_pool_start: resolveFileToken(
													argv[
														"static-addressing-dhcp-server-dhcp-pool-start"
													] as string | undefined,
													"static-addressing-dhcp-server-dhcp-pool-start",
													"text"
												),
												dns_servers:
													argv["static-addressing-dhcp-server-dns-servers"],
											},
											secondary_address: resolveFileToken(
												argv["static-addressing-secondary-address"] as
													| string
													| undefined,
												"static-addressing-secondary-address",
												"text"
											),
											virtual_address: resolveFileToken(
												argv["static-addressing-virtual-address"] as
													| string
													| undefined,
												"static-addressing-virtual-address",
												"text"
											),
										},
										vlan_tag: argv["vlan-tag"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.magicTransit.sites.lans.update({
							body: bodyData,
							account_id: accountId,
							site_id: argv["site-id"],
							lan_id: argv["lan-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					bond_id: argv["bond-id"],
					ha_link: argv["ha-link"],
					is_breakout: argv["is-breakout"],
					is_prioritized: argv["is-prioritized"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					nat: {
						static_prefix: resolveFileToken(
							argv["nat-static-prefix"] as string | undefined,
							"nat-static-prefix",
							"text"
						),
					},
					physport: argv["physport"],
					routed_subnets: parseObjectArray(
						argv["routed-subnets"],
						"routed-subnets"
					),
					static_addressing: {
						address: resolveFileToken(
							argv["static-addressing-address"] as string | undefined,
							"static-addressing-address",
							"text"
						),
						dhcp_relay: {
							server_addresses:
								argv["static-addressing-dhcp-relay-server-addresses"],
						},
						dhcp_server: {
							dhcp_pool_end: resolveFileToken(
								argv["static-addressing-dhcp-server-dhcp-pool-end"] as
									| string
									| undefined,
								"static-addressing-dhcp-server-dhcp-pool-end",
								"text"
							),
							dhcp_pool_start: resolveFileToken(
								argv["static-addressing-dhcp-server-dhcp-pool-start"] as
									| string
									| undefined,
								"static-addressing-dhcp-server-dhcp-pool-start",
								"text"
							),
							dns_servers: argv["static-addressing-dhcp-server-dns-servers"],
						},
						secondary_address: resolveFileToken(
							argv["static-addressing-secondary-address"] as string | undefined,
							"static-addressing-secondary-address",
							"text"
						),
						virtual_address: resolveFileToken(
							argv["static-addressing-virtual-address"] as string | undefined,
							"static-addressing-virtual-address",
							"text"
						),
					},
					vlan_tag: argv["vlan-tag"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.sites.lans.update({
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
						lan_id: argv["lan-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
