import operation from "../../_operations/iam/sso/begin-verification.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./begin-verification.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "iam sso begin-verification",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf iam sso begin-verification",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/sso_connectors/${argv["sso-connector-id"] == null ? "<sso-connector-id>" : encodeURIComponent(String(argv["sso-connector-id"]))}/begin_verification`,
					pathParams: {
						"sso-connector-id": String(argv["sso-connector-id"] ?? ""),
					},
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					account_id: accountId,
					sso_connector_id: argv["sso-connector-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
