import operation from "../../../../_operations/realtime/kit/recordings/tracks/start.js";
/**
 * start command
 * @generated from apis/overlays/realtime.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "start <app-id>",
	describe: "Start recording participant audio tracks",
	usage:
		"$0 realtime kit recordings tracks start <app-id>\n\nStarts track recording for a meeting. Track recording currently records separate participant audio tracks as WebM files in the RealtimeKit bucket. Video track recording is in development. For more information, refer to [Track recording](/realtime/realtimekit/recording-guide/track-recording/).",
	flags: {
		layers: {
			kind: "parsed",
			brief:
				'Optional audio layer configuration. If omitted, RealtimeKit records all participant audio using the default file name prefix. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		"meeting-id": {
			kind: "parsed",
			brief: "ID of the meeting to record.",
			optional: true,
			parse: String,
		},
		"user-ids": {
			kind: "parsed",
			brief:
				"Optional list of participant user IDs to record. Selective track recording (`user_ids`) is in early beta contact support to use this feature.",
			variadic: true,
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
			brief:
				"Starts audio track recording for an active meeting. Use `layers` only when you need to set a file name prefix. Selective track recording (`user_ids`) is in early beta contact support to use this feature.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "app-id", brief: "The app identifier tag.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit recordings tracks start",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["meeting-id"] === undefined) {
						argv["meeting-id"] = await promptForRequiredField(
							"meeting-id",
							"ID of the meeting to record."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit recordings tracks start",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/recordings/track`,
						pathParams: { "app-id": String(argv["app-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											layers: parseJsonMap(argv["layers"], "layers"),
											meeting_id: resolveFileToken(
												argv["meeting-id"] as string | undefined,
												"meeting-id",
												"text"
											),
											user_ids: argv["user-ids"],
										},
										[["layers"]]
									),
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
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						layers: parseJsonMap(argv["layers"], "layers"),
						meeting_id: resolveFileToken(
							argv["meeting-id"] as string | undefined,
							"meeting-id",
							"text"
						),
						user_ids: argv["user-ids"],
					},
					[["layers"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
