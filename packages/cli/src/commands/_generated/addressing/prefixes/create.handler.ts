import operation from "../../_operations/addressing/prefixes/create.js";
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
			command: "addressing prefixes create",
			classification: {
				safeFlags: ["delegate-loa-creation", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["asn"] === undefined) {
					throw new Error(
						"--asn is required (or pass --body with this field set)."
					);
				}
				if (argv["cidr"] === undefined) {
					argv["cidr"] = await promptForRequiredField(
						"cidr",
						"IP Prefix in Classless Inter-Domain Routing format."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf addressing prefixes create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/prefixes`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									asn: argv["asn"],
									cidr: resolveFileToken(
										argv["cidr"] as string | undefined,
										"cidr",
										"text"
									),
									delegate_loa_creation: argv["delegate-loa-creation"],
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									loa_document_id: resolveFileToken(
										argv["loa-document-id"] as string | undefined,
										"loa-document-id",
										"text"
									),
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				asn: argv["asn"],
				cidr: resolveFileToken(
					argv["cidr"] as string | undefined,
					"cidr",
					"text"
				),
				delegate_loa_creation: argv["delegate-loa-creation"],
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				loa_document_id: resolveFileToken(
					argv["loa-document-id"] as string | undefined,
					"loa-document-id",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
