import operation from "../../../_operations/cloudforce-one/threat-intel/events/bulk-create.js";
/**
 * bulk-create command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "bulk-create",
	describe: "Create events in bulk",
	usage:
		"$0 cloudforce-one threat-intel events bulk-create\n\nCreates multiple events in one dataset. `datasetId` is required; to find dataset IDs, use `threat-intel datasets list`. Set `includeCreatedEvents` to return the UUIDs of the created events.",
	flags: {
		data: {
			kind: "parsed",
			brief:
				'The data field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"category": string, "date": string, "event": string, "raw": {...}, "tlp": string, ...more}].',
			optional: true,
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief: "The datasetId field",
			optional: true,
			parse: String,
		},
		"include-created-events": {
			kind: "boolean",
			brief:
				"When true, response includes array of created event UUIDs and shard IDs. Useful for tracking which events were created and where.",
			optional: true,
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel events bulk-create",
				classification: {
					safeFlags: ["include-created-events", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["data"] === undefined) {
						throw new Error(
							"--data is required (or pass --body with this field set)."
						);
					}
					if (argv["dataset-id"] === undefined) {
						argv["dataset-id"] = await promptForRequiredField(
							"dataset-id",
							"The datasetId field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel events bulk-create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/create/bulk`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										data: parseObjectArray(argv["data"], "data"),
										datasetId: resolveFileToken(
											argv["dataset-id"] as string | undefined,
											"dataset-id",
											"text"
										),
										includeCreatedEvents: argv["include-created-events"],
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
					data: parseObjectArray(argv["data"], "data"),
					datasetId: resolveFileToken(
						argv["dataset-id"] as string | undefined,
						"dataset-id",
						"text"
					),
					includeCreatedEvents: argv["include-created-events"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
