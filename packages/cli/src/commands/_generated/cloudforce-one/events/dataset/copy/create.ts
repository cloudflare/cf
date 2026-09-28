import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events dataset copy create <dataset-id>\n\nCopies specified events from one dataset to another dataset"
		)
		.positional("dataset-id", {
			type: "string",
			description: "Dataset UUID.",
			demandOption: true,
		})
		.option("keep-raw-data", {
			type: "boolean",
			description:
				"If true, copies raw data to the destination dataset. Default is false (raw data is stripped/not copied).",
		})
		.option("dest-dataset-id", {
			type: "string",
			description: "The destDatasetId field",
		})
		.option("event-ids", {
			type: "string",
			array: true,
			description: "The eventIds field",
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

type Request = SdkRequest<"post_EventCopyToNewDS">;
type Body = Request;
type Query = SdkQuery<"post_EventCopyToNewDS">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <dataset-id>",
	describe: "Copies specified events from one dataset to another dataset",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events dataset copy create",
				classification: {
					safeFlags: ["keep-raw-data", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					keepRawData: argv["keep-raw-data"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events dataset copy create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/copy`,
						pathParams: { "dataset-id": String(argv["dataset-id"] ?? "") },
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destDatasetId: resolveFileToken(
											argv["dest-dataset-id"] as string | undefined,
											"dest-dataset-id",
											"text"
										),
										eventIds: argv["event-ids"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.cloudforceOne.events.dataset.copy.create({
							...bodyData,
							account_id: accountId,
							dataset_id: argv["dataset-id"],
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["dest-dataset-id"] === undefined) {
					argv["dest-dataset-id"] = await promptForRequiredField(
						"dest-dataset-id",
						"The destDatasetId field"
					);
				}
				if (argv["event-ids"] === undefined) {
					throw new Error(
						"--event-ids is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					destDatasetId: resolveFileToken(
						argv["dest-dataset-id"] as string | undefined,
						"dest-dataset-id",
						"text"
					),
					eventIds: argv["event-ids"],
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.events.dataset.copy.create({
						...bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
