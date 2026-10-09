import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * upsert command
 * @generated from apis/overlays/o11y.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 o11y metrics-export upsert\n\nCreate or replace resources configured for Workers Observability metrics export."
		)
		.option("requester-requester-id", {
			type: "string",
			description: "The requester.requesterId field",
		})
		.option("requester-requester-type", {
			type: "string",
			description: "The requester.requesterType field",
			choices: ["workers"],
		})
		.coerce("requester-requester-type", (value: string | undefined) =>
			resolveFileToken(value, "requester-requester-type", "text")
		)
		.option("resources", {
			type: "string",
			description:
				"The resources field. Provide as a JSON array of objects or @path/to/file.json.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "upsert",
	describe: "Upsert Metrics Exports",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y metrics-export upsert",
				classification: {
					safeFlags: ["requester-requester-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y metrics-export upsert",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/metricsexport`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										requester: {
											requesterId: resolveFileToken(
												argv["requester-requester-id"] as string | undefined,
												"requester-requester-id",
												"text"
											),
											requesterType: argv["requester-requester-type"],
										},
										resources: parseObjectArray(argv["resources"], "resources"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/workers/observability/metricsexport`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["requester-requester-id"] === undefined) {
					argv["requester-requester-id"] = await promptForRequiredField(
						"requester-requester-id",
						"The requester.requesterId field"
					);
				}
				if (argv["requester-requester-type"] === undefined) {
					argv["requester-requester-type"] = await promptForRequiredEnumField(
						"requester-requester-type",
						"The requester.requesterType field",
						["workers"] as const
					);
				}
				if (argv["resources"] === undefined) {
					throw new Error(
						"--resources is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["requester-requester-id"] !== undefined)
					setNestedValue(
						bodyData,
						["requester", "requesterId"],
						resolveFileToken(
							argv["requester-requester-id"] as string | undefined,
							"requester-requester-id",
							"text"
						)
					);
				if (argv["requester-requester-type"] !== undefined)
					setNestedValue(
						bodyData,
						["requester", "requesterType"],
						argv["requester-requester-type"]
					);
				if (argv["resources"] !== undefined)
					setNestedValue(
						bodyData,
						["resources"],
						parseObjectArray(argv["resources"], "resources")
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/workers/observability/metricsexport`,
						{ body: Object.keys(bodyData).length > 0 ? bodyData : undefined }
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
