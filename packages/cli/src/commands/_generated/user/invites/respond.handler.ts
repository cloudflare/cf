import operation from "../../_operations/user/invites/respond.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./respond.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "user invites respond",
			classification: {
				safeFlags: ["status", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["status"] === undefined) {
					argv["status"] = await promptForRequiredEnumField(
						"status",
						"Status of your response to the invitation (rejected or accepted).",
						["accepted", "rejected"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf user invites respond",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/user/invites/${argv["invite-id"] == null ? "<invite-id>" : encodeURIComponent(String(argv["invite-id"]))}`,
					pathParams: { "invite-id": String(argv["invite-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									status: argv["status"],
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
					client.send(operation, {
						body: bodyData,
						invite_id: argv["invite-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				status: argv["status"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, invite_id: argv["invite-id"] })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
