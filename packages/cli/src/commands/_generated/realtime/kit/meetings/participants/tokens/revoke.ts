import operation from "../../../../../_operations/realtime/kit/meetings/participants/tokens/revoke.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * revoke command
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
import { confirmDelete, promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 realtime kit meetings participants tokens revoke <participant-id>\n\nRevokes a previously issued participant authentication token without deleting the participant. Other tokens issued to the participant remain valid."
		)
		.positional("participant-id", {
			type: "string",
			description:
				"ID of the participant. You can fetch the participant ID using the add a participant API.",
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
		.option("token", {
			type: "string",
			description: "The participant authentication token to revoke.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "revoke <participant-id>",
	describe: "Revoke participant's authentication token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit meetings participants tokens revoke",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit meetings participants tokens revoke",
						method: "DELETE",
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
										token: resolveFileToken(
											argv["token"] as string | undefined,
											"token",
											"text"
										),
									}),
						sensitiveBodyPaths: [["token"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
							meeting_id: argv["meeting-id"],
							participant_id: argv["participant-id"],
						})
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
				if (argv["token"] === undefined) {
					argv["token"] = await promptForRequiredField(
						"token",
						"The participant authentication token to revoke.",
						{ kind: "secret" }
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					token: resolveFileToken(
						argv["token"] as string | undefined,
						"token",
						"text"
					),
				});
				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						meeting_id: argv["meeting-id"],
						participant_id: argv["participant-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
