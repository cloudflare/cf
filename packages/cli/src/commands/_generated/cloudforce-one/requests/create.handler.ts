import operation from "../../_operations/cloudforce-one/requests/create.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one requests create",
			classification: {
				safeFlags: ["priority", "tlp", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one requests create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}`,
					pathParams: { "project-type": String(argv["project-type"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										eventId: resolveFileToken(
											argv["event-id"] as string | undefined,
											"event-id",
											"text"
										),
										metadata: parseJsonMap(argv["metadata"], "metadata"),
										priority: argv["priority"],
										request_type: resolveFileToken(
											argv["request-type"] as string | undefined,
											"request-type",
											"text"
										),
										subtypeId: resolveFileToken(
											argv["subtype-id"] as string | undefined,
											"subtype-id",
											"text"
										),
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
											"text"
										),
										tlp: argv["tlp"],
									},
									[["metadata"]]
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						project_type: argv["project-type"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					eventId: resolveFileToken(
						argv["event-id"] as string | undefined,
						"event-id",
						"text"
					),
					metadata: parseJsonMap(argv["metadata"], "metadata"),
					priority: argv["priority"],
					request_type: resolveFileToken(
						argv["request-type"] as string | undefined,
						"request-type",
						"text"
					),
					subtypeId: resolveFileToken(
						argv["subtype-id"] as string | undefined,
						"subtype-id",
						"text"
					),
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					tlp: argv["tlp"],
				},
				[["metadata"]]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					project_type: argv["project-type"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
