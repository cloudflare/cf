import operation from "../../../_operations/realtime/kit/livestreams/start.js";
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
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "start <meeting-id>",
	describe: "Start livestreaming a meeting",
	usage:
		"$0 realtime kit livestreams start <meeting-id>\n\nStarts livestream of a meeting associated with the given meeting ID. Retreive the meeting ID using the `Create a meeting` API.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"video-config-height": {
			kind: "parsed",
			brief: "Height of the livestreaming video in pixels",
			optional: true,
			parse: Number,
		},
		"video-config-width": {
			kind: "parsed",
			brief: "Width of the livestreaming video in pixels",
			optional: true,
			parse: Number,
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
		{ placeholder: "meeting-id", brief: "ID of the meeting", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit livestreams start",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit livestreams start",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/meetings/${argv["meeting-id"] == null ? "<meeting-id>" : encodeURIComponent(String(argv["meeting-id"]))}/livestreams`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"meeting-id": String(argv["meeting-id"] ?? ""),
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
										video_config: {
											height: argv["video-config-height"],
											width: argv["video-config-width"],
										},
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

				// Assemble request body from individual flags
				const bodyData = compactBody({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					video_config: {
						height: argv["video-config-height"],
						width: argv["video-config-width"],
					},
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
