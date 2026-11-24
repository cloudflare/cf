import operation from "../../_operations/organizations/members/list.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "organizations members list",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				status: argv["status"],
				"user.email": argv["user-email"],
				"user.email.contains": argv["user-email-contains"],
				"user.email.startsWith": argv["user-email-starts-with"],
				"user.email.endsWith": argv["user-email-ends-with"],
				page_token: argv["page-token"],
				page_size: argv["page-size"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf organizations members list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/members`,
					pathParams: {
						"organization-id": String(argv["organization-id"] ?? ""),
					},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, {
					organization_id: argv["organization-id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
