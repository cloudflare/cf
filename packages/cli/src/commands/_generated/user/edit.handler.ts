import operation from "../_operations/user/edit.js";
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
			command: "user edit",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf user edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/user`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									country: resolveFileToken(
										argv["country"] as string | undefined,
										"country",
										"text"
									),
									first_name: resolveFileToken(
										argv["first-name"] as string | undefined,
										"first-name",
										"text"
									),
									last_name: resolveFileToken(
										argv["last-name"] as string | undefined,
										"last-name",
										"text"
									),
									telephone: resolveFileToken(
										argv["telephone"] as string | undefined,
										"telephone",
										"text"
									),
									zipcode: resolveFileToken(
										argv["zipcode"] as string | undefined,
										"zipcode",
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
				country: resolveFileToken(
					argv["country"] as string | undefined,
					"country",
					"text"
				),
				first_name: resolveFileToken(
					argv["first-name"] as string | undefined,
					"first-name",
					"text"
				),
				last_name: resolveFileToken(
					argv["last-name"] as string | undefined,
					"last-name",
					"text"
				),
				telephone: resolveFileToken(
					argv["telephone"] as string | undefined,
					"telephone",
					"text"
				),
				zipcode: resolveFileToken(
					argv["zipcode"] as string | undefined,
					"zipcode",
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
