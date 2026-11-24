import operation from "../../../../_operations/zero-trust/access/logs/access-requests/list.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
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
			command: "zero-trust access logs access-requests list",
			classification: {
				safeFlags: [
					"direction",
					"email-exact",
					"allowed-op",
					"country-code-op",
					"app-type-op",
					"app-uid-op",
					"ray-id-op",
					"email-op",
					"idp-op",
					"non-identity-op",
					"user-id-op",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				limit: argv["limit"],
				direction: argv["direction"],
				since: argv["since"],
				until: argv["until"],
				page: argv["page"],
				per_page: argv["per-page"],
				email: argv["email"],
				email_exact: argv["email-exact"],
				user_id: argv["user-id"],
				allowedOp: argv["allowed-op"],
				country_codeOp: argv["country-code-op"],
				app_typeOp: argv["app-type-op"],
				app_uidOp: argv["app-uid-op"],
				ray_idOp: argv["ray-id-op"],
				emailOp: argv["email-op"],
				idpOp: argv["idp-op"],
				non_identityOp: argv["non-identity-op"],
				user_idOp: argv["user-id-op"],
				fields: argv["fields"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust access logs access-requests list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/logs/access_requests`,
					pathParams: {},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { account_id: accountId, ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
