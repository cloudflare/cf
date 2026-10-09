import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/spectrum.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 spectrum apps update <app-id>\n\nUpdates a previously existing application's configuration that uses a name for the origin."
		)
		.positional("app-id", {
			type: "string",
			description: "App identifier.",
			demandOption: true,
		})
		.option("argo-smart-routing", {
			type: "boolean",
			description:
				'Enables Argo Smart Routing for this application.\nNotes: Only available for TCP or UDP applications with traffic_type set to "direct".',
		})
		.option("dns-name", {
			type: "string",
			description:
				"The name of the DNS record associated with the application.",
		})
		.option("dns-type", {
			type: "string",
			description: "The type of DNS record associated with the application.",
			choices: ["CNAME", "ADDRESS"],
		})
		.coerce("dns-type", (value: string | undefined) =>
			resolveFileToken(value, "dns-type", "text")
		)
		.option("edge-ips-connectivity", {
			type: "string",
			description:
				"The IP versions supported for inbound connections on Spectrum anycast IPs.",
			choices: ["all", "ipv4", "ipv6"],
		})
		.coerce("edge-ips-connectivity", (value: string | undefined) =>
			resolveFileToken(value, "edge-ips-connectivity", "text")
		)
		.option("edge-ips-type", {
			type: "string",
			description:
				"The type of edge IP configuration specified. Dynamically allocated edge IPs use Spectrum anycast IPs in accordance with the connectivity you specify. Only valid with CNAME DNS names.",
			choices: ["dynamic", "static"],
		})
		.coerce("edge-ips-type", (value: string | undefined) =>
			resolveFileToken(value, "edge-ips-type", "text")
		)
		.option("edge-ips-ips", {
			type: "string",
			array: true,
			description:
				"The array of customer owned IPs we broadcast via anycast for this hostname and application.",
		})
		.option("ip-firewall", {
			type: "boolean",
			description:
				"Enables IP Access Rules for this application.\nNotes: Only available for TCP applications.",
		})
		.option("origin-direct", {
			type: "string",
			array: true,
			description:
				"List of origin IP addresses. Array may contain multiple IP addresses for load balancing.",
		})
		.option("origin-dns-name", {
			type: "string",
			description: "The name of the DNS record associated with the origin.",
		})
		.option("origin-dns-ttl", {
			type: "number",
			description: "The TTL of our resolution of your DNS record in seconds.",
		})
		.option("origin-dns-type", {
			type: "string",
			description:
				'The type of DNS record associated with the origin. "" is used to specify a combination of A/AAAA records.',
			choices: ["A", "AAAA", "SRV"],
		})
		.coerce("origin-dns-type", (value: string | undefined) =>
			resolveFileToken(value, "origin-dns-type", "text")
		)
		.option("origin-worker-id", {
			type: "string",
			description:
				'Optional Worker script tag (worker ID) to use as the application\'s origin. Only supported for TCP applications with traffic_type "worker"; mutually exclusive with origin_direct, origin_dns, origin_port, proxy_protocol, and argo_smart_routing. tls may only be "off" or "flexible".',
		})
		.option("protocol", {
			type: "string",
			description:
				'The port configuration at Cloudflare\'s edge. May specify a single port, for example `"tcp/1000"`, or a range of ports, for example `"tcp/1000-2000"`.',
		})
		.option("proxy-protocol", {
			type: "string",
			description:
				"Enables Proxy Protocol to the origin. Refer to [Enable Proxy protocol](https://developers.cloudflare.com/spectrum/getting-started/proxy-protocol/) for implementation details on PROXY Protocol V1, PROXY Protocol V2, and Simple Proxy Protocol.",
			choices: ["off", "v1", "v2", "simple"],
		})
		.coerce("proxy-protocol", (value: string | undefined) =>
			resolveFileToken(value, "proxy-protocol", "text")
		)
		.option("tls", {
			type: "string",
			description:
				"The type of TLS termination associated with the application.",
			choices: ["off", "flexible", "full", "strict"],
		})
		.coerce("tls", (value: string | undefined) =>
			resolveFileToken(value, "tls", "text")
		)
		.option("traffic-type", {
			type: "string",
			description:
				'Determines how data travels from the edge to your origin. When set to "direct", Spectrum will send traffic directly to your origin, and the application\'s type is derived from the `protocol`. When set to "http" or "https", Spectrum will apply Cloudflare\'s HTTP/HTTPS features as it sends traffic to your origin, and the application type matches this property exactly. When set to "worker", traffic is sent to the Worker specified by `origin_worker_id`.',
			choices: ["direct", "http", "https", "worker"],
		})
		.coerce("traffic-type", (value: string | undefined) =>
			resolveFileToken(value, "traffic-type", "text")
		)
		.option("virtual-network-id", {
			type: "string",
			description:
				"Optional UUID of a virtual network for routing origin traffic through tunnel virtual networks.",
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
		.conflicts("edge-ips-connectivity", ["edge-ips-ips"])
		.conflicts("edge-ips-ips", ["edge-ips-connectivity"]);
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"spectrum-applications-update-spectrum-application-configuration-using-a-name-for-the-origin">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <app-id>",
	describe:
		"Update Spectrum application configuration using a name for the origin",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf spectrum apps update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/spectrum/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.spectrum.apps.update({
							body: bodyData,
							zone_id: zoneId,
							app_id: argv["app-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["protocol"] === undefined) {
					argv["protocol"] = await promptForRequiredField(
						"protocol",
						'The port configuration at Cloudflare\'s edge. May specify a single port, for example \`"tcp/1000"\`, or a range of ports, for example \`"tcp/1000-2000"\`.'
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					argo_smart_routing: argv["argo-smart-routing"],
					dns: {
						name: resolveFileToken(
							argv["dns-name"] as string | undefined,
							"dns-name",
							"text"
						),
						type: argv["dns-type"],
					},
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
					client.spectrum.apps.update({
						body: bodyData,
						zone_id: zoneId,
						app_id: argv["app-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
