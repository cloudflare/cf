import operation from "../../../../../_operations/realtime/kit/meetings/participants/tokens/revoke.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./revoke.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "realtime kit meetings participants tokens revoke",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["token"] === undefined) {
					argv["token"] = await promptForRequiredField(
						"token",
						"The participant authentication token to revoke.",
						{ kind: "secret" }
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
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
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
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
			await resolveRequiredFields();

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
	);
}
