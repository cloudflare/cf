import operation from "../../_operations/spectrum/apps/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseScalarValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "spectrum apps update",
			classification: {
				safeFlags: [
					"argo-smart-routing",
					"dns-type",
					"edge-ips-connectivity",
					"edge-ips-type",
					"ip-firewall",
					"origin-dns-type",
					"proxy-protocol",
					"tls",
					"traffic-type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["protocol"] === undefined) {
					argv["protocol"] = await promptForRequiredField(
						"protocol",
						'The port configuration at Cloudflare\'s edge. May specify a single port, for example \`"tcp/1000"\`, or a range of ports, for example \`"tcp/1000-2000"\`.'
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf spectrum apps update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/spectrum/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						"app-id": String(argv["app-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									argo_smart_routing: argv["argo-smart-routing"],
									dns: {
										name: resolveFileToken(
											argv["dns-name"] as string | undefined,
											"dns-name",
											"text"
										),
										type: argv["dns-type"],
									},
									edge_alpn_protocols: argv["edge-alpn-protocols"],
									edge_ips: {
										connectivity: argv["edge-ips-connectivity"],
										type: argv["edge-ips-type"],
										ips: argv["edge-ips-ips"],
									},
									ip_firewall: argv["ip-firewall"],
									origin_direct: argv["origin-direct"],
									origin_dns: {
										name: resolveFileToken(
											argv["origin-dns-name"] as string | undefined,
											"origin-dns-name",
											"text"
										),
										ttl: argv["origin-dns-ttl"],
										type: argv["origin-dns-type"],
									},
									origin_port: parseScalarValue(
										argv["origin-port"],
										"origin-port"
									),
									origin_worker_id: resolveFileToken(
										argv["origin-worker-id"] as string | undefined,
										"origin-worker-id",
										"text"
									),
									protocol: resolveFileToken(
										argv["protocol"] as string | undefined,
										"protocol",
										"text"
									),
									proxy_protocol: argv["proxy-protocol"],
									tls: argv["tls"],
									traffic_type: argv["traffic-type"],
									virtual_network_id: resolveFileToken(
										argv["virtual-network-id"] as string | undefined,
										"virtual-network-id",
										"text"
									),
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						app_id: argv["app-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				argo_smart_routing: argv["argo-smart-routing"],
				dns: {
					name: resolveFileToken(
						argv["dns-name"] as string | undefined,
						"dns-name",
						"text"
					),
					type: argv["dns-type"],
				},
				edge_alpn_protocols: argv["edge-alpn-protocols"],
				edge_ips: {
					connectivity: argv["edge-ips-connectivity"],
					type: argv["edge-ips-type"],
					ips: argv["edge-ips-ips"],
				},
				ip_firewall: argv["ip-firewall"],
				origin_direct: argv["origin-direct"],
				origin_dns: {
					name: resolveFileToken(
						argv["origin-dns-name"] as string | undefined,
						"origin-dns-name",
						"text"
					),
					ttl: argv["origin-dns-ttl"],
					type: argv["origin-dns-type"],
				},
				origin_port: parseScalarValue(argv["origin-port"], "origin-port"),
				origin_worker_id: resolveFileToken(
					argv["origin-worker-id"] as string | undefined,
					"origin-worker-id",
					"text"
				),
				protocol: resolveFileToken(
					argv["protocol"] as string | undefined,
					"protocol",
					"text"
				),
				proxy_protocol: argv["proxy-protocol"],
				tls: argv["tls"],
				traffic_type: argv["traffic-type"],
				virtual_network_id: resolveFileToken(
					argv["virtual-network-id"] as string | undefined,
					"virtual-network-id",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					zone_id: zoneId,
					app_id: argv["app-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
