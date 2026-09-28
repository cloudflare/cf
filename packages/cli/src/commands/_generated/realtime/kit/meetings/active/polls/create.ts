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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/realtime.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 realtime kit meetings active polls create <meeting-id>\n\nCreates a new poll in an active session for the given meeting ID."
		)
		.positional("meeting-id", {
			type: "string",
			description: "ID of the meeting",
			demandOption: true,
		})
		.option("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("anonymous", {
			type: "boolean",
			description: "if voters on a poll are anonymous",
		})
		.option("hide-votes", {
			type: "boolean",
			description: "if votes on an option are visible before a person votes",
		})
		.option("options", {
			type: "string",
			array: true,
			description: "Different options for the question",
		})
		.option("question", { type: "string", description: "Question of the poll" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Request body for creating a new poll",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"CreatePoll">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <meeting-id>",
	describe: "Create a poll",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit meetings active polls create",
				classification: {
					safeFlags: ["anonymous", "hide-votes", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.realtime.kit.meetings.active.polls.create({
							...bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
							meeting_id: argv["meeting-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.realtime.kit.meetings.active.polls.create({
						...bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						meeting_id: argv["meeting-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
