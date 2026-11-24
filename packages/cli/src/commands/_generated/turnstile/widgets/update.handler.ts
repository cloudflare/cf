import operation from "../../_operations/turnstile/widgets/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "turnstile widgets update",
			classification: {
				safeFlags: [
					"bot-fight-mode",
					"clearance-level",
					"ephemeral-id",
					"widget-mode",
					"offlabel",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["domains"] === undefined) {
					throw new Error(
						"--domains is required (or pass --body with this field set)."
					);
				}
				if (argv["widget-mode"] === undefined) {
					argv["widget-mode"] = await promptForRequiredEnumField(
						"widget-mode",
						"Widget mode",
						["non-interactive", "invisible", "managed"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Human readable widget name. Not unique. Cloudflare suggests that you set this to a meaningful string to make it easier to identify your widget, and where it is used. "
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf turnstile widgets update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/challenges/widgets/${argv["sitekey"] == null ? "<sitekey>" : encodeURIComponent(String(argv["sitekey"]))}`,
					pathParams: { sitekey: String(argv["sitekey"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									bot_fight_mode: argv["bot-fight-mode"],
									clearance_level: argv["clearance-level"],
									domains: argv["domains"],
									ephemeral_id: argv["ephemeral-id"],
									mode: argv["widget-mode"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									offlabel: argv["offlabel"],
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
						sitekey: argv["sitekey"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				bot_fight_mode: argv["bot-fight-mode"],
				clearance_level: argv["clearance-level"],
				domains: argv["domains"],
				ephemeral_id: argv["ephemeral-id"],
				mode: argv["widget-mode"],
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				offlabel: argv["offlabel"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					sitekey: argv["sitekey"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
