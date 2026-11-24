import operation from "../../../_operations/cloudforce-one/priority-intelligence/matches/update.js";
/**
 * update command
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <priority-id>",
	describe: "Triage a priority intelligence requirement's matched events",
	usage:
		"$0 cloudforce-one priority-intelligence matches update <priority-id>\n\nSets `triage_state` (`new`, `relevant`, or `not_relevant`) on up to 100 matches. Matches that do not exist, or are in datasets the account can no longer read, are returned in `not_found`. Setting `new` clears `triaged_at` and `triaged_by`. Requires the Threat Events entitlement.",
	flags: {
		matches: {
			kind: "parsed",
			brief:
				'Up to 100 matches to set the triage state on. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"dataset_id": string, "event_id": string}].',
			optional: true,
			parse: String,
		},
		"triage-state": {
			kind: "parsed",
			brief: "The triage_state field",
			optional: true,
			choices: ["new", "relevant", "not_relevant"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "triage-state", "text"),
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
	operands: [
		{ placeholder: "priority-id", brief: "Priority ID", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence matches update",
				classification: {
					safeFlags: ["triage-state", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["matches"] === undefined) {
						throw new Error(
							"--matches is required (or pass --body with this field set)."
						);
					}
					if (argv["triage-state"] === undefined) {
						argv["triage-state"] = await promptForRequiredEnumField(
							"triage-state",
							"The triage_state field",
							["new", "relevant", "not_relevant"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one priority-intelligence matches update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/${argv["priority-id"] == null ? "<priority-id>" : encodeURIComponent(String(argv["priority-id"]))}/matches`,
						pathParams: { "priority-id": String(argv["priority-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										matches: parseObjectArray(argv["matches"], "matches"),
										triage_state: argv["triage-state"],
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
							priority_id: argv["priority-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					matches: parseObjectArray(argv["matches"], "matches"),
					triage_state: argv["triage-state"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						priority_id: argv["priority-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
