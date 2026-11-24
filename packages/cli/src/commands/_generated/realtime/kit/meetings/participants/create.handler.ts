import operation from "../../../../_operations/realtime/kit/meetings/participants/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "realtime kit meetings participants create",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
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
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
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
	);
}
