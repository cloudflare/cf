import operation from "../../../_operations/cloudforce-one/threat-intel/indicators/bulk-create.js";
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "bulk-create",
	describe: "Create indicators in bulk",
	usage:
		"$0 cloudforce-one threat-intel indicators bulk-create\n\nCreates multiple indicators in a dataset in one request. Set `autoCreateType` to create any indicator types that don't exist.",
	flags: {
		"dataset-id": { kind: "parsed", brief: "Dataset UUID.", parse: String },
		"auto-create-type": {
			kind: "boolean",
			brief:
				"Global flag to automatically create indicator types if they don't exist. Individual indicators can override this with their own autoCreateType flag. When false, a non-analytics dataset still accepts pre-approved types (the same list event create accepts, such as BITCOIN or ERC-20) and registers them on first use. Analytics datasets do not check registered types.",
			optional: true,
		},
		indicators: {
			kind: "parsed",
			brief:
				'The indicators field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"indicatorType": string, "value": string, "autoCreateType"?: boolean, "relatedEvents"?: [{...}], "tags"?: [(string | {...})], ...more}]. ? marks optional keys.',
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel indicators bulk-create",
				classification: {
					safeFlags: ["auto-create-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["indicators"] === undefined) {
						throw new Error(
							"--indicators is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel indicators bulk-create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/indicators/bulk`,
						pathParams: { "dataset-id": String(argv["dataset-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										autoCreateType: argv["auto-create-type"],
										indicators: parseObjectArray(
											argv["indicators"],
											"indicators"
										),
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							dataset_id: argv["dataset-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					autoCreateType: argv["auto-create-type"],
					indicators: parseObjectArray(argv["indicators"], "indicators"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
