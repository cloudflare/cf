import operation from "../../../_operations/stream/videos/audio-tracks/edit.js";
/**
 * edit command
 * @generated from apis/overlays/stream.ts
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
	command: "edit <audio-identifier>",
	describe: "Edit additional audio tracks on a video",
	usage:
		"$0 stream videos audio-tracks edit <audio-identifier>\n\nEdits additional audio tracks on a video. Editing the default status of an audio track to `true` will mark all other audio tracks on the video default status to `false`.",
	flags: {
		identifier: {
			kind: "parsed",
			brief: "A Cloudflare-generated unique identifier for a media item.",
			parse: String,
		},
		default: {
			kind: "boolean",
			brief:
				"Denotes whether the audio track will be played by default in a player.",
			optional: true,
		},
		label: {
			kind: "parsed",
			brief:
				"A string to uniquely identify the track amongst other audio track labels for the specified video.",
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
			placeholder: "audio-identifier",
			brief: "The unique identifier for an additional audio track.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos audio-tracks edit",
				classification: {
					safeFlags: ["default", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos audio-tracks edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/audio/${argv["audio-identifier"] == null ? "<audio-identifier>" : encodeURIComponent(String(argv["audio-identifier"]))}`,
						pathParams: {
							identifier: String(argv["identifier"] ?? ""),
							"audio-identifier": String(argv["audio-identifier"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default: argv["default"],
										label: resolveFileToken(
											argv["label"] as string | undefined,
											"label",
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
							identifier: argv["identifier"],
							audio_identifier: argv["audio-identifier"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					default: argv["default"],
					label: resolveFileToken(
						argv["label"] as string | undefined,
						"label",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						identifier: argv["identifier"],
						audio_identifier: argv["audio-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
