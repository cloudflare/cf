import operation from "../../_operations/load-balancers/pools/update.js";
/**
 * update command
 * @generated from apis/overlays/load-balancers.ts
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
	command: "update <pool-id>",
	describe: "Update Pool",
	usage:
		"$0 load-balancers pools update <pool-id>\n\nModify a configured pool.",
	flags: {
		"check-regions": {
			kind: "parsed",
			brief:
				"A list of regions from which to run health checks. Null means every Cloudflare data center.",
			variadic: true,
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "A human-readable description of the pool.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether to enable (the default) or disable this pool. Disabled pools will not receive traffic and are excluded from health checks. Disabling a pool will cause any load balancers using it to failover to the next pool (if any).",
			optional: true,
		},
		"health-sources": {
			kind: "parsed",
			brief:
				'A list of health sources, ordered from highest to lowest priority, used to evaluate individual origin health and overall pool health. The load balancer uses the first source that has data and falls back to the next. Currently accepted values are null or the exact array ["regional", "global"]; any other combination is rejected. Null (the default) behaves like ["local", "global"]. ["regional", "global"] makes each region steer on its own health, falling back to the global decision when a region has no fresh data. Setting regional requires at least one region in check_regions.',
			variadic: true,
			optional: true,
			parse: String,
		},
		latitude: {
			kind: "parsed",
			brief:
				"The latitude of the data center containing the origins used in this pool in decimal degrees. If this is set, longitude must also be set.",
			optional: true,
			parse: Number,
		},
		"load-shedding-default-percent": {
			kind: "parsed",
			brief:
				"The percent of traffic to shed from the pool, according to the default policy. Applies to new sessions and traffic without session affinity.",
			optional: true,
			parse: Number,
		},
		"load-shedding-default-policy": {
			kind: "parsed",
			brief:
				"The default policy to use when load shedding. A random policy randomly sheds a given percent of requests. A hash policy computes a hash over the CF-Connecting-IP address and sheds all requests originating from a percent of IPs.",
			optional: true,
			choices: ["random", "hash"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "load-shedding-default-policy", "text"),
		},
		"load-shedding-session-percent": {
			kind: "parsed",
			brief:
				"The percent of existing sessions to shed from the pool, according to the session policy.",
			optional: true,
			parse: Number,
		},
		"load-shedding-session-policy": {
			kind: "parsed",
			brief:
				"Only the hash policy is supported for existing sessions (to avoid exponential decay).",
			optional: true,
			choices: ["hash"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "load-shedding-session-policy", "text"),
		},
		longitude: {
			kind: "parsed",
			brief:
				"The longitude of the data center containing the origins used in this pool in decimal degrees. If this is set, latitude must also be set.",
			optional: true,
			parse: Number,
		},
		"minimum-origins": {
			kind: "parsed",
			brief:
				"The minimum number of origins that must be healthy for this pool to serve traffic. If the number of healthy origins falls below this number, the pool will be marked unhealthy and will failover to the next available pool.",
			optional: true,
			parse: Number,
		},
		monitor: {
			kind: "parsed",
			brief:
				"The ID of the Monitor to use for checking the health of origins within this pool.",
			optional: true,
			parse: String,
		},
		"monitor-group": {
			kind: "parsed",
			brief:
				"The ID of the Monitor Group to use for checking the health of origins within this pool.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"A short name (tag) for the pool. Only alphanumeric characters, hyphens, and underscores are allowed.",
			optional: true,
			parse: String,
		},
		networks: {
			kind: "parsed",
			brief: "List of networks where Load Balancer or Pool is enabled.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"notification-email": {
			kind: "parsed",
			brief:
				"This field is now deprecated. It has been moved to Cloudflare's Centralized Notification service https://developers.cloudflare.com/fundamentals/notifications/. The email address to send health status notifications to. This can be an individual mailbox or a mailing list. Multiple emails can be supplied as a comma delimited list.",
			optional: true,
			parse: String,
		},
		"notification-filter-origin-disable": {
			kind: "boolean",
			brief:
				"If set true, disable notifications for this type of resource (pool or origin).",
			optional: true,
		},
		"notification-filter-origin-healthy": {
			kind: "boolean",
			brief:
				"If present, send notifications only for this health status (e.g. false for only DOWN events). Use null to reset (all events).",
			optional: true,
		},
		"notification-filter-pool-disable": {
			kind: "boolean",
			brief:
				"If set true, disable notifications for this type of resource (pool or origin).",
			optional: true,
		},
		"notification-filter-pool-healthy": {
			kind: "boolean",
			brief:
				"If present, send notifications only for this health status (e.g. false for only DOWN events). Use null to reset (all events).",
			optional: true,
		},
		"origin-steering-policy": {
			kind: "parsed",
			brief:
				'The type of origin steering policy to use.\n- `"random"`: Select an origin randomly.\n- `"hash"`: Select an origin by computing a hash over the CF-Connecting-IP address.\n- `"least_outstanding_requests"`: Select an origin by taking into consideration origin weights, as well as each origin\'s number of outstanding requests. Origins with more pending requests are weighted proportionately less relative to others.\n- `"least_connections"`: Select an origin by taking into consideration origin weights, as well as each origin\'s number of open connections. Origins with more open connections are weighted proportionately less relative to others. Supported for HTTP/1 and HTTP/2 connections.',
			optional: true,
			choices: [
				"random",
				"hash",
				"least_outstanding_requests",
				"least_connections",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "origin-steering-policy", "text"),
		},
		origins: {
			kind: "parsed",
			brief:
				'The list of origins within this pool. Traffic directed at this pool is balanced across all currently healthy origins, provided the pool itself is healthy. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"address"?: string, "enabled"?: boolean, "flatten_cname"?: boolean, "header"?: {...}, "name"?: string, ...more}]. ? marks optional keys.',
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
	operands: [{ placeholder: "pool-id", brief: "Pool ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "load-balancers pools update",
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
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf load-balancers pools update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/load_balancers/pools/${argv["pool-id"] == null ? "<pool-id>" : encodeURIComponent(String(argv["pool-id"]))}`,
						pathParams: { "pool-id": String(argv["pool-id"] ?? "") },
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
							pool_id: argv["pool-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						pool_id: argv["pool-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
