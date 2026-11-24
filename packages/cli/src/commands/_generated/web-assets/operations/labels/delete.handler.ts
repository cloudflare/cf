import operation from "../../../_operations/web-assets/operations/labels/delete.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./delete.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "web-assets operations labels delete",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf web-assets operations labels delete",
					method: "DELETE",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/operations/${argv["operation-id"] == null ? "<operation-id>" : encodeURIComponent(String(argv["operation-id"]))}/labels`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						"operation-id": String(argv["operation-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									managed: argv["managed"],
									user: argv["user"],
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `This operation removes the selected labels from the web or API operation.`,
				}))
			) {
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						operation_id: argv["operation-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				managed: argv["managed"],
				user: argv["user"],
			});
			const result = await withProgress(`Deleting`, async () =>
				client.send(operation, {
					body: bodyData,
					zone_id: zoneId,
					operation_id: argv["operation-id"],
				})
			);
			formatOutput(result, { successLabel: `Deleted` });
		}
	);
}
