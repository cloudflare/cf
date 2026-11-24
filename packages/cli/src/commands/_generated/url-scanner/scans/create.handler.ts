import operation from "../../_operations/url-scanner/scans/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "url-scanner scans create",
			classification: {
				safeFlags: ["agent-readiness", "country", "visibility", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["url"] === undefined) {
					argv["url"] = await promptForRequiredField("url", "The url field");
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf url-scanner scans create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/urlscanner/v2/scan`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										agentReadiness: argv["agent-readiness"],
										country: argv["country"],
										customHeaders: parseJsonMap(
											argv["custom-headers"],
											"custom-headers"
										),
										customagent: resolveFileToken(
											argv["customagent"] as string | undefined,
											"customagent",
											"text"
										),
										referer: resolveFileToken(
											argv["referer"] as string | undefined,
											"referer",
											"text"
										),
										screenshotsResolutions: argv["screenshots-resolutions"],
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
										visibility: argv["visibility"],
									},
									[["customHeaders"]]
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					agentReadiness: argv["agent-readiness"],
					country: argv["country"],
					customHeaders: parseJsonMap(argv["custom-headers"], "custom-headers"),
					customagent: resolveFileToken(
						argv["customagent"] as string | undefined,
						"customagent",
						"text"
					),
					referer: resolveFileToken(
						argv["referer"] as string | undefined,
						"referer",
						"text"
					),
					screenshotsResolutions: argv["screenshots-resolutions"],
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
					visibility: argv["visibility"],
				},
				[["customHeaders"]]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
