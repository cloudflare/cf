import operation from "../../_operations/load-balancers/pools/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
					command: "cf load-balancers pools create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/load_balancers/pools`,
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
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
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
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
