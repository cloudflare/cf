import operation from "../../../../_operations/realtime/kit/meetings/participants/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 realtime kit meetings participants create <meeting-id>\n\nAdds a participant to the given meeting ID."
		)
		.positional("meeting-id", {
			type: "string",
			description:
				"ID of the meeting. Fetch the meeting ID using the create a meeting API.",
			demandOption: true,
		})
		.option("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("custom-participant-id", {
			type: "string",
			description:
				"A unique participant ID. You must specify a unique ID for the participant, for example, UUID, email address, and so on. ",
		})
		.option("name", {
			type: "string",
			description: "(Optional) Name of the participant. ",
		})
		.option("picture", {
			type: "string",
			description:
				"(Optional) A URL to a picture to be used for the participant. ",
		})
		.option("preset-name", {
			type: "string",
			description: "Name of the preset to apply to this participant.",
			default: "group_call_host",
		})
		.option("token-expires-on", {
			type: "string",
			description:
				"RFC 3339 timestamp with a timezone at or after which the token cannot be used. Must be in the future. Defaults to not_before plus 100 days.",
		})
		.option("token-not-before", {
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
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <meeting-id>",
	describe: "Add a participant",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit meetings participants create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit meetings participants create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/meetings/${argv["meeting-id"] == null ? "<meeting-id>" : encodeURIComponent(String(argv["meeting-id"]))}/participants`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"meeting-id": String(argv["meeting-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										custom_participant_id: resolveFileToken(
											argv["custom-participant-id"] as string | undefined,
											"custom-participant-id",
											"text"
										),
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
										token: {
											expires_on: resolveFileToken(
												argv["token-expires-on"] as string | undefined,
												"token-expires-on",
												"text"
											),
											not_before: resolveFileToken(
												argv["token-not-before"] as string | undefined,
												"token-not-before",
												"text"
											),
										},
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
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["custom-participant-id"] === undefined) {
					argv["custom-participant-id"] = await promptForRequiredField(
						"custom-participant-id",
						"A unique participant ID. You must specify a unique ID for the participant, for example, UUID, email address, and so on. "
					);
				}
				if (argv["preset-name"] === undefined) {
					argv["preset-name"] = await promptForRequiredField(
						"preset-name",
						"Name of the preset to apply to this participant."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					custom_participant_id: resolveFileToken(
						argv["custom-participant-id"] as string | undefined,
						"custom-participant-id",
						"text"
					),
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
					token: {
						expires_on: resolveFileToken(
							argv["token-expires-on"] as string | undefined,
							"token-expires-on",
							"text"
						),
						not_before: resolveFileToken(
							argv["token-not-before"] as string | undefined,
							"token-not-before",
							"text"
						),
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
};

export default command;
