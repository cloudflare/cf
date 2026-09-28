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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/load-balancers.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 load-balancers pools create\n\nCreate a new pool.")
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

type Request = SdkRequest<"account-load-balancer-pools-create-pool">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Pool",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "load-balancers pools create",
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
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf load-balancers pools create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/load_balancers/pools`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										latitude: argv["latitude"],
										load_shedding: {
											default_percent: argv["load-shedding-default-percent"],
											default_policy: resolveFileToken(
												argv["load-shedding-default-policy"] as
													| string
													| undefined,
												"load-shedding-default-policy",
												"text"
											),
											session_percent: argv["load-shedding-session-percent"],
											session_policy: resolveFileToken(
												argv["load-shedding-session-policy"] as
													| string
													| undefined,
												"load-shedding-session-policy",
												"text"
											),
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
											policy: resolveFileToken(
												argv["origin-steering-policy"] as string | undefined,
												"origin-steering-policy",
												"text"
											),
										},
										origins: parseObjectArray(argv["origins"], "origins"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.loadBalancers.pools.create({
							...bodyData,
							account_id: accountId,
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
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					latitude: argv["latitude"],
					load_shedding: {
						default_percent: argv["load-shedding-default-percent"],
						default_policy: resolveFileToken(
							argv["load-shedding-default-policy"] as string | undefined,
							"load-shedding-default-policy",
							"text"
						),
						session_percent: argv["load-shedding-session-percent"],
						session_policy: resolveFileToken(
							argv["load-shedding-session-policy"] as string | undefined,
							"load-shedding-session-policy",
							"text"
						),
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
						policy: resolveFileToken(
							argv["origin-steering-policy"] as string | undefined,
							"origin-steering-policy",
							"text"
						),
					},
					origins: parseObjectArray(argv["origins"], "origins"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.loadBalancers.pools.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
