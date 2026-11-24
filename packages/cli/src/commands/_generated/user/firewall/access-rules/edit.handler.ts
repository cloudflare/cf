import operation from "../../../_operations/user/firewall/access-rules/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "user firewall access-rules edit",
			classification: {
				safeFlags: ["access-rule-mode", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf user firewall access-rules edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/user/firewall/access_rules/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
					pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									mode: argv["access-rule-mode"],
									notes: resolveFileToken(
										argv["notes"] as string | undefined,
										"notes",
										"text"
									),
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, rule_id: argv["rule-id"] })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				mode: argv["access-rule-mode"],
				notes: resolveFileToken(
					argv["notes"] as string | undefined,
					"notes",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, rule_id: argv["rule-id"] })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
