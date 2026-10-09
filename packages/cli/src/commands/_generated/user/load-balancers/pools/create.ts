import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 user load-balancers pools create\n\nCreate a new pool.")
		.option("check-regions", {
			type: "string",
			array: true,
			description:
				"A list of regions from which to run health checks. Null means every Cloudflare data center.",
		})
		.option("description", {
			type: "string",
			description: "A human-readable description of the pool.",
			default: "",
		})
		.option("enabled", {
			type: "boolean",
			description:
				"Whether to enable (the default) or disable this pool. Disabled pools will not receive traffic and are excluded from health checks. Disabling a pool will cause any load balancers using it to failover to the next pool (if any).",
			default: true,
		})
		.option("health-sources", {
			type: "string",
			array: true,
			description:
				'A list of health sources, ordered from highest to lowest priority, used to evaluate individual origin health and overall pool health. The load balancer uses the first source that has data and falls back to the next. Currently accepted values are null or the exact array ["regional", "global"]; any other combination is rejected. Null (the default) behaves like ["local", "global"]. ["regional", "global"] makes each region steer on its own health, falling back to the global decision when a region has no fresh data. Setting regional requires at least one region in check_regions.',
		})
		.option("latitude", {
			type: "number",
			description:
				"The latitude of the data center containing the origins used in this pool in decimal degrees. If this is set, longitude must also be set.",
		})
		.option("load-shedding-default-percent", {
			type: "number",
			description:
				"The percent of traffic to shed from the pool, according to the default policy. Applies to new sessions and traffic without session affinity.",
		})
		.option("load-shedding-default-policy", {
			type: "string",
			description:
				"The default policy to use when load shedding. A random policy randomly sheds a given percent of requests. A hash policy computes a hash over the CF-Connecting-IP address and sheds all requests originating from a percent of IPs.",
			choices: ["random", "hash"],
		})
		.coerce("load-shedding-default-policy", (value: string | undefined) =>
			resolveFileToken(value, "load-shedding-default-policy", "text")
		)
		.option("load-shedding-session-percent", {
			type: "number",
			description:
				"The percent of existing sessions to shed from the pool, according to the session policy.",
		})
		.option("load-shedding-session-policy", {
			type: "string",
			description:
				"Only the hash policy is supported for existing sessions (to avoid exponential decay).",
			choices: ["hash"],
		})
		.coerce("load-shedding-session-policy", (value: string | undefined) =>
			resolveFileToken(value, "load-shedding-session-policy", "text")
		)
		.option("longitude", {
			type: "number",
			description:
				"The longitude of the data center containing the origins used in this pool in decimal degrees. If this is set, latitude must also be set.",
		})
		.option("minimum-origins", {
			type: "number",
			description:
				"The minimum number of origins that must be healthy for this pool to serve traffic. If the number of healthy origins falls below this number, the pool will be marked unhealthy and will failover to the next available pool.",
			default: 1,
		})
		.option("monitor", {
			type: "string",
			description:
				"The ID of the Monitor to use for checking the health of origins within this pool.",
		})
		.option("monitor-group", {
			type: "string",
			description:
				"The ID of the Monitor Group to use for checking the health of origins within this pool.",
		})
		.option("name", {
			type: "string",
			description:
				"A short name (tag) for the pool. Only alphanumeric characters, hyphens, and underscores are allowed.",
		})
		.option("networks", {
			type: "string",
			array: true,
			description: "List of networks where Load Balancer or Pool is enabled.",
		})
		.option("notification-email", {
			type: "string",
			description:
				"This field is now deprecated. It has been moved to Cloudflare's Centralized Notification service https://developers.cloudflare.com/fundamentals/notifications/. The email address to send health status notifications to. This can be an individual mailbox or a mailing list. Multiple emails can be supplied as a comma delimited list.",
			default: "",
		})
		.option("notification-filter-origin-disable", {
			type: "boolean",
			description:
				"If set true, disable notifications for this type of resource (pool or origin).",
		})
		.option("notification-filter-origin-healthy", {
			type: "boolean",
			description:
				"If present, send notifications only for this health status (e.g. false for only DOWN events). Use null to reset (all events).",
		})
		.option("notification-filter-pool-disable", {
			type: "boolean",
			description:
				"If set true, disable notifications for this type of resource (pool or origin).",
		})
		.option("notification-filter-pool-healthy", {
			type: "boolean",
			description:
				"If present, send notifications only for this health status (e.g. false for only DOWN events). Use null to reset (all events).",
		})
		.option("origin-steering-policy", {
			type: "string",
			description:
				'The type of origin steering policy to use.\n- `"random"`: Select an origin randomly.\n- `"hash"`: Select an origin by computing a hash over the CF-Connecting-IP address.\n- `"least_outstanding_requests"`: Select an origin by taking into consideration origin weights, as well as each origin\'s number of outstanding requests. Origins with more pending requests are weighted proportionately less relative to others.\n- `"least_connections"`: Select an origin by taking into consideration origin weights, as well as each origin\'s number of open connections. Origins with more open connections are weighted proportionately less relative to others. Supported for HTTP/1 and HTTP/2 connections.',
			choices: [
				"random",
				"hash",
				"least_outstanding_requests",
				"least_connections",
			],
		})
		.coerce("origin-steering-policy", (value: string | undefined) =>
			resolveFileToken(value, "origin-steering-policy", "text")
		)
		.option("origins", {
			type: "string",
			description:
				"The list of origins within this pool. Traffic directed at this pool is balanced across all currently healthy origins, provided the pool itself is healthy. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"load-balancer-pools-create-pool">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Pool",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancers pools create",
				classification: {
					safeFlags: [
						"enabled",
						"load-shedding-default-policy",
						"load-shedding-session-policy",
						"notification-filter-origin-disable",
						"notification-filter-origin-healthy",
						"notification-filter-pool-disable",
						"notification-filter-pool-healthy",
						"origin-steering-policy",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers pools create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										check_regions: argv["check-regions"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										health_sources: argv["health-sources"],
										latitude: argv["latitude"],
										load_shedding: {
											default_percent: argv["load-shedding-default-percent"],
											default_policy: argv["load-shedding-default-policy"],
											session_percent: argv["load-shedding-session-percent"],
											session_policy: argv["load-shedding-session-policy"],
										},
										longitude: argv["longitude"],
										minimum_origins: argv["minimum-origins"],
										monitor: resolveFileToken(
											argv["monitor"] as string | undefined,
											"monitor",
											"text"
										),
										monitor_group: resolveFileToken(
											argv["monitor-group"] as string | undefined,
											"monitor-group",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										networks: argv["networks"],
										notification_email: resolveFileToken(
											argv["notification-email"] as string | undefined,
											"notification-email",
											"text"
										),
										notification_filter: {
											origin: {
												disable: argv["notification-filter-origin-disable"],
												healthy: argv["notification-filter-origin-healthy"],
											},
											pool: {
												disable: argv["notification-filter-pool-disable"],
												healthy: argv["notification-filter-pool-healthy"],
											},
										},
										origin_steering: {
											policy: argv["origin-steering-policy"],
										},
										origins: parseObjectArray(argv["origins"], "origins"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.user.loadBalancers.pools.create({
							...bodyData,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"A short name (tag) for the pool. Only alphanumeric characters, hyphens, and underscores are allowed."
					);
				}
				if (argv["origins"] === undefined) {
					throw new Error(
						"--origins is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					check_regions: argv["check-regions"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					health_sources: argv["health-sources"],
					latitude: argv["latitude"],
					load_shedding: {
						default_percent: argv["load-shedding-default-percent"],
						default_policy: argv["load-shedding-default-policy"],
						session_percent: argv["load-shedding-session-percent"],
						session_policy: argv["load-shedding-session-policy"],
					},
					longitude: argv["longitude"],
					minimum_origins: argv["minimum-origins"],
					monitor: resolveFileToken(
						argv["monitor"] as string | undefined,
						"monitor",
						"text"
					),
					monitor_group: resolveFileToken(
						argv["monitor-group"] as string | undefined,
						"monitor-group",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					networks: argv["networks"],
					notification_email: resolveFileToken(
						argv["notification-email"] as string | undefined,
						"notification-email",
						"text"
					),
					notification_filter: {
						origin: {
							disable: argv["notification-filter-origin-disable"],
							healthy: argv["notification-filter-origin-healthy"],
						},
						pool: {
							disable: argv["notification-filter-pool-disable"],
							healthy: argv["notification-filter-pool-healthy"],
						},
					},
					origin_steering: {
						policy: argv["origin-steering-policy"],
					},
					origins: parseObjectArray(argv["origins"], "origins"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.user.loadBalancers.pools.create({
						...bodyData,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
