import operation from "../../../../../_operations/realtime/kit/meetings/active/polls/create.js";
/**
 * create command
 * @generated from apis/overlays/realtime.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create <meeting-id>",
	describe: "Create a poll",
	usage:
		"$0 realtime kit meetings active polls create <meeting-id>\n\nCreates a new poll in an active session for the given meeting ID.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		anonymous: {
			kind: "boolean",
			brief: "if voters on a poll are anonymous",
			optional: true,
		},
		"hide-votes": {
			kind: "boolean",
			brief: "if votes on an option are visible before a person votes",
			optional: true,
		},
		options: {
			kind: "parsed",
			brief: "Different options for the question",
			variadic: true,
			optional: true,
			parse: String,
		},
		question: {
			kind: "parsed",
			brief: "Question of the poll",
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
			brief: "Request body for creating a new poll",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "meeting-id", brief: "ID of the meeting", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit meetings active polls create",
				classification: {
					safeFlags: ["anonymous", "hide-votes", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["options"] === undefined) {
						throw new Error(
							"--options is required (or pass --body with this field set)."
						);
					}
					if (argv["question"] === undefined) {
						argv["question"] = await promptForRequiredField(
							"question",
							"Question of the poll"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit meetings active polls create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/meetings/${argv["meeting-id"] == null ? "<meeting-id>" : encodeURIComponent(String(argv["meeting-id"]))}/active-session/poll`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"meeting-id": String(argv["meeting-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										anonymous: argv["anonymous"],
										hide_votes: argv["hide-votes"],
										options: argv["options"],
										question: resolveFileToken(
											argv["question"] as string | undefined,
											"question",
											"text"
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
							app_id: argv["app-id"],
							meeting_id: argv["meeting-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					anonymous: argv["anonymous"],
					hide_votes: argv["hide-votes"],
					options: argv["options"],
					question: resolveFileToken(
						argv["question"] as string | undefined,
						"question",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						meeting_id: argv["meeting-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
