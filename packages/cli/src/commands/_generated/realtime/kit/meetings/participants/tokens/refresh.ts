import operation from "../../../../../_operations/realtime/kit/meetings/participants/tokens/refresh.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * refresh command
 * @generated from apis/overlays/realtime.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 realtime kit meetings participants tokens refresh <participant-id>\n\nRegenerates participant's authentication token for the given meeting and participant ID."
		)
		.positional("participant-id", {
			type: "string",
			description:
				"ID of the participant. You can fetch the participant ID using the add a  participant API.",
			demandOption: true,
		})
		.option("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("meeting-id", {
			type: "string",
			description:
				"ID of the meeting. You can fetch the meeting ID using the create a meeting API.",
			demandOption: true,
		})
		.option("expires-on", {
			type: "string",
			description:
				"RFC 3339 timestamp with a timezone at or after which the token cannot be used. Must be in the future. Defaults to not_before plus 100 days.",
		})
		.option("not-before", {
			type: "string",
			description:
				"RFC 3339 timestamp with a timezone before which the token cannot be used. Defaults to the current time. May be in the past.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Validity window of the participant authentication token. The window is [not_before, expires_on) and cannot be longer than 100 days. Defaults to a token valid from now for 100 days.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "refresh <participant-id>",
	describe: "Refresh participant's authentication token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit meetings participants tokens refresh",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit meetings participants tokens refresh",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/meetings/${argv["meeting-id"] == null ? "<meeting-id>" : encodeURIComponent(String(argv["meeting-id"]))}/participants/${argv["participant-id"] == null ? "<participant-id>" : encodeURIComponent(String(argv["participant-id"]))}/token`,
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
										expires_on: resolveFileToken(
											argv["expires-on"] as string | undefined,
											"expires-on",
											"text"
										),
										not_before: resolveFileToken(
											argv["not-before"] as string | undefined,
											"not-before",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
							meeting_id: argv["meeting-id"],
							participant_id: argv["participant-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					expires_on: resolveFileToken(
						argv["expires-on"] as string | undefined,
						"expires-on",
						"text"
					),
					not_before: resolveFileToken(
						argv["not-before"] as string | undefined,
						"not-before",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						meeting_id: argv["meeting-id"],
						participant_id: argv["participant-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
