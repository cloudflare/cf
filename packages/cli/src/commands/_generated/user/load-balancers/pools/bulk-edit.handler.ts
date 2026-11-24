import operation from "../../../_operations/user/load-balancers/pools/bulk-edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./bulk-edit.js";
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
			command: "user load-balancers pools bulk-edit",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf user load-balancers pools bulk-edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									notification_email: resolveFileToken(
										argv["notification-email"] as string | undefined,
										"notification-email",
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
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				notification_email: resolveFileToken(
					argv["notification-email"] as string | undefined,
					"notification-email",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
