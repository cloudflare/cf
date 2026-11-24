import operation from "../_operations/organizations/list.js";
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
			command: "organizations list",
			classification: {
				safeFlags: ["order-by", "direction", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				id: argv["id"],
				name: argv["name"],
				"name.startsWith": argv["name-starts-with"],
				"name.endsWith": argv["name-ends-with"],
				"name.contains": argv["name-contains"],
				"containing.account": argv["containing-account"],
				"containing.user": argv["containing-user"],
				"containing.organization": argv["containing-organization"],
				"parent.id": argv["parent-id"],
				"member.email": argv["member-email"],
				order_by: argv["order-by"],
				direction: argv["direction"],
				page_token: argv["page-token"],
				page_size: argv["page-size"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf organizations list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/organizations`,
					pathParams: {},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, queryParams)
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
