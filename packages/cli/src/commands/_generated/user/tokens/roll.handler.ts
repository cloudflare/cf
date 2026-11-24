import operation from "../../_operations/user/tokens/roll.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./roll.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "user tokens roll",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf user tokens roll",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/user/tokens/${argv["token-id"] == null ? "<token-id>" : encodeURIComponent(String(argv["token-id"]))}/value`,
					pathParams: { "token-id": String(argv["token-id"] ?? "") },
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `Rolling this token will invalidate the current secret and generate a new one. Any integrations using the current secret will stop working.`,
				}))
			) {
				return;
			}

			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { token_id: argv["token-id"] })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
