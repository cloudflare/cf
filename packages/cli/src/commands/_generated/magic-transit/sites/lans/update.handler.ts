import operation from "../../../_operations/magic-transit/sites/lans/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "magic-transit sites lans update",
			classification: {
				safeFlags: ["ha-link", "is-breakout", "is-prioritized", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
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
							: compactBody(
									{
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
										remote_subnets: parseObjectArray(
											argv["remote-subnets"],
											"remote-subnets"
										),
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
												dhcp_options: parseObjectArray(
													argv["static-addressing-dhcp-server-dhcp-options"],
													"static-addressing-dhcp-server-dhcp-options"
												),
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
												dns_server: resolveFileToken(
													argv["static-addressing-dhcp-server-dns-server"] as
														| string
														| undefined,
													"static-addressing-dhcp-server-dns-server",
													"text"
												),
												dns_servers:
													argv["static-addressing-dhcp-server-dns-servers"],
												reservations: parseJsonMap(
													argv["static-addressing-dhcp-server-reservations"],
													"static-addressing-dhcp-server-reservations"
												),
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
									},
									[["static_addressing", "dhcp_server", "reservations"]]
								),
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
						site_id: argv["site-id"],
						lan_id: argv["lan-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
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
					remote_subnets: parseObjectArray(
						argv["remote-subnets"],
						"remote-subnets"
					),
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
							dhcp_options: parseObjectArray(
								argv["static-addressing-dhcp-server-dhcp-options"],
								"static-addressing-dhcp-server-dhcp-options"
							),
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
							dns_server: resolveFileToken(
								argv["static-addressing-dhcp-server-dns-server"] as
									| string
									| undefined,
								"static-addressing-dhcp-server-dns-server",
								"text"
							),
							dns_servers: argv["static-addressing-dhcp-server-dns-servers"],
							reservations: parseJsonMap(
								argv["static-addressing-dhcp-server-reservations"],
								"static-addressing-dhcp-server-reservations"
							),
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
				},
				[["static_addressing", "dhcp_server", "reservations"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					site_id: argv["site-id"],
					lan_id: argv["lan-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
