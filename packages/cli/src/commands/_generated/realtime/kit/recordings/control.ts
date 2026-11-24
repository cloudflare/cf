import operation from "../../../_operations/realtime/kit/recordings/control.js";
/**
 * control command
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "control <recording-id>",
	describe: "Pause/Resume/Stop recording",
	usage:
		"$0 realtime kit recordings control <recording-id>\n\nPause/Resume/Stop a given recording ID. **Note:** A recording can stay paused for a maximum of 12 hours. After that, it automatically resumes and finishes.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		action: {
			kind: "parsed",
			brief: "The action field",
			optional: true,
			choices: ["stop", "pause", "resume"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
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
		{
			placeholder: "recording-id",
			brief: "ID of the recording",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit recordings control",
				classification: {
					safeFlags: ["action", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["action"] === undefined) {
						argv["action"] = await promptForRequiredEnumField(
							"action",
							"The action field",
							["stop", "pause", "resume"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit recordings control",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/recordings/${argv["recording-id"] == null ? "<recording-id>" : encodeURIComponent(String(argv["recording-id"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"recording-id": String(argv["recording-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: argv["action"],
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
							app_id: argv["app-id"],
							recording_id: argv["recording-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					action: argv["action"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						recording_id: argv["recording-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
