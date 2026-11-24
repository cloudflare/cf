import operation from "../../_operations/o11y/metrics-export/upsert.js";
/**
 * upsert command
 * @generated from apis/overlays/o11y.ts
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "upsert",
	describe: "Upsert Metrics Exports",
	usage:
		"$0 o11y metrics-export upsert\n\nCreate or replace resources configured for Workers Observability metrics export.",
	flags: {
		"requester-requester-id": {
			kind: "parsed",
			brief: "The requester.requesterId field",
			optional: true,
			parse: String,
		},
		"requester-requester-type": {
			kind: "parsed",
			brief: "The requester.requesterType field",
			optional: true,
			choices: ["workers"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "requester-requester-type", "text"),
		},
		resources: {
			kind: "parsed",
			brief:
				'The resources field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"destinations": [string], "resourceId": string, "resourceType": "workers" | "d1" | "r2" | ...more}].',
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
				command: "o11y metrics-export upsert",
				classification: {
					safeFlags: ["requester-requester-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
					requester: {
						requesterId: resolveFileToken(
							argv["requester-requester-id"] as string | undefined,
							"requester-requester-id",
							"text"
						),
						requesterType: argv["requester-requester-type"],
					},
					resources: parseObjectArray(argv["resources"], "resources"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
