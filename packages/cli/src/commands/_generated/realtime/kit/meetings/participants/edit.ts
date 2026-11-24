import operation from "../../../../_operations/realtime/kit/meetings/participants/edit.js";
/**
 * edit command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <participant-id>",
	describe: "Edit a participant's detail",
	usage:
		"$0 realtime kit meetings participants edit <participant-id>\n\nUpdates a participant's details for the given meeting and participant ID.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"meeting-id": {
			kind: "parsed",
			brief:
				"ID of the meeting. You can fetch the meeting ID using the create a meeting API.",
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "(Optional) Name of the participant.",
			optional: true,
			parse: String,
		},
		picture: {
			kind: "parsed",
			brief: "(Optional) A URL to a picture to be used for the participant.",
			optional: true,
			parse: String,
		},
		"preset-name": {
			kind: "parsed",
			brief: "(Optional) Name of the preset to apply to this participant.",
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
	operands: [
		{
			placeholder: "participant-id",
			brief:
				"ID of the participant. You can fetch the participant ID using the add a participant API.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit meetings participants edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit meetings participants edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/meetings/${argv["meeting-id"] == null ? "<meeting-id>" : encodeURIComponent(String(argv["meeting-id"]))}/participants/${argv["participant-id"] == null ? "<participant-id>" : encodeURIComponent(String(argv["participant-id"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"meeting-id": String(argv["meeting-id"] ?? ""),
							"participant-id": String(argv["participant-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										picture: resolveFileToken(
											argv["picture"] as string | undefined,
											"picture",
											"text"
										),
										preset_name: resolveFileToken(
											argv["preset-name"] as string | undefined,
											"preset-name",
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
							meeting_id: argv["meeting-id"],
							participant_id: argv["participant-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					picture: resolveFileToken(
						argv["picture"] as string | undefined,
						"picture",
						"text"
					),
					preset_name: resolveFileToken(
						argv["preset-name"] as string | undefined,
						"preset-name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						meeting_id: argv["meeting-id"],
						participant_id: argv["participant-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
