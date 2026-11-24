import operation from "../../_operations/organizations/profile/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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
			command: "organizations profile update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf organizations profile update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/profile`,
					pathParams: {
						"organization-id": String(argv["organization-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									business_address: resolveFileToken(
										argv["business-address"] as string | undefined,
										"business-address",
										"text"
									),
									business_email: resolveFileToken(
										argv["business-email"] as string | undefined,
										"business-email",
										"text"
									),
									business_name: resolveFileToken(
										argv["business-name"] as string | undefined,
										"business-name",
										"text"
									),
									business_phone: resolveFileToken(
										argv["business-phone"] as string | undefined,
										"business-phone",
										"text"
									),
									external_metadata: resolveFileToken(
										argv["external-metadata"] as string | undefined,
										"external-metadata",
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
					client.send(operation, {
						body: bodyData,
						organization_id: argv["organization-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				business_address: resolveFileToken(
					argv["business-address"] as string | undefined,
					"business-address",
					"text"
				),
				business_email: resolveFileToken(
					argv["business-email"] as string | undefined,
					"business-email",
					"text"
				),
				business_name: resolveFileToken(
					argv["business-name"] as string | undefined,
					"business-name",
					"text"
				),
				business_phone: resolveFileToken(
					argv["business-phone"] as string | undefined,
					"business-phone",
					"text"
				),
				external_metadata: resolveFileToken(
					argv["external-metadata"] as string | undefined,
					"external-metadata",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					organization_id: argv["organization-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
