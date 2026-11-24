import operation from "../../../_operations/stream/live-inputs/outputs/create.js";
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
			command: "stream live-inputs outputs create",
			classification: {
				safeFlags: ["enabled", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["stream-key"] === undefined) {
					argv["stream-key"] = await promptForRequiredField(
						"stream-key",
						"The streamKey used to authenticate against an output's target.",
						{ kind: "secret" }
					);
				}
				if (argv["url"] === undefined) {
					argv["url"] = await promptForRequiredField(
						"url",
						"The URL an output uses to restream.",
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
					command: "cf stream live-inputs outputs create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/live_inputs/${argv["live-input-identifier"] == null ? "<live-input-identifier>" : encodeURIComponent(String(argv["live-input-identifier"]))}/outputs`,
					pathParams: {
						"live-input-identifier": String(
							argv["live-input-identifier"] ?? ""
						),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									enabled: argv["enabled"],
									streamKey: resolveFileToken(
										argv["stream-key"] as string | undefined,
										"stream-key",
										"text"
									),
									url: resolveFileToken(
										argv["url"] as string | undefined,
										"url",
										"text"
									),
								}),
					sensitiveBodyPaths: [["streamKey"], ["url"]],
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
						live_input_identifier: argv["live-input-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				enabled: argv["enabled"],
				streamKey: resolveFileToken(
					argv["stream-key"] as string | undefined,
					"stream-key",
					"text"
				),
				url: resolveFileToken(argv["url"] as string | undefined, "url", "text"),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					live_input_identifier: argv["live-input-identifier"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
