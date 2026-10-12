import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/logs.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
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
			"$0 logs datasets create\n\nCreate a new Log Explorer dataset for the account or zone. List available account or zone datasets to see the dataset types and fields you can use. The `fields` property is optional. If not specified, all available fields will be enabled. For dataset field definitions, see: https://developers.cloudflare.com/logs/logpush/logpush-job/datasets/"
		)
		.option("dataset", {
			type: "string",
			description: "Dataset type name to create (e.g. `http_requests`).",
		})
		.option("fields", {
			type: "string",
			description:
				"Controls which fields the API ingests. Defaults to all available\nfields when absent.\n. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("filter", {
			type: "string",
			description:
				"Optional Logpush filter predicate to restrict which events are ingested.\nSee [Logpush filters](https://developers.cloudflare.com/logs/reference/filters/)\nfor syntax and examples.\n",
		})
		.option("filter-attack-traffic", {
			type: "boolean",
			description:
				"Whether to filter attack traffic from the Logpush job. Defaults to\n`true` for supported datasets when omitted. Supported datasets are\n`http_requests`, `firewall_events`, and `network_analytics_logs`.\n",
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

type Request =
	SdkRequest<"generated:post:/{account_or_zone}/{account_or_zone_id}/logs/explorer/datasets">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create an account or zone dataset",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logs datasets create",
				classification: {
					safeFlags: ["filter-attack-traffic", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf logs datasets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/logs/explorer/datasets`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										dataset: resolveFileToken(
											argv["dataset"] as string | undefined,
											"dataset",
											"text"
										),
										fields: parseObjectArray(argv["fields"], "fields"),
										filter: resolveFileToken(
											argv["filter"] as string | undefined,
											"filter",
											"text"
										),
										filter_attack_traffic: argv["filter-attack-traffic"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.logs.datasets.create({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["dataset"] === undefined) {
					argv["dataset"] = await promptForRequiredField(
						"dataset",
						"Dataset type name to create (e.g. \`http_requests\`)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					dataset: resolveFileToken(
						argv["dataset"] as string | undefined,
						"dataset",
						"text"
					),
					fields: parseObjectArray(argv["fields"], "fields"),
					filter: resolveFileToken(
						argv["filter"] as string | undefined,
						"filter",
						"text"
					),
					filter_attack_traffic: argv["filter-attack-traffic"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.logs.datasets.create({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
