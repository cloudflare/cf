import operation from "../../_operations/o11y/destinations/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "o11y destinations update",
			classification: {
				safeFlags: [
					"configuration-replace-headers",
					"configuration-type",
					"enabled",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf o11y destinations update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/destinations/${argv["slug"] == null ? "<slug>" : encodeURIComponent(String(argv["slug"]))}`,
					pathParams: { slug: String(argv["slug"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										configuration: {
											headers: parseJsonMap(
												argv["configuration-headers"],
												"configuration-headers"
											),
											replaceHeaders: argv["configuration-replace-headers"],
											type: argv["configuration-type"],
											url: resolveFileToken(
												argv["configuration-url"] as string | undefined,
												"configuration-url",
												"text"
											),
										},
										enabled: argv["enabled"],
									},
									[["configuration", "headers"]]
								),
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
						slug: argv["slug"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					configuration: {
						headers: parseJsonMap(
							argv["configuration-headers"],
							"configuration-headers"
						),
						replaceHeaders: argv["configuration-replace-headers"],
						type: argv["configuration-type"],
						url: resolveFileToken(
							argv["configuration-url"] as string | undefined,
							"configuration-url",
							"text"
						),
					},
					enabled: argv["enabled"],
				},
				[["configuration", "headers"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					slug: argv["slug"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
