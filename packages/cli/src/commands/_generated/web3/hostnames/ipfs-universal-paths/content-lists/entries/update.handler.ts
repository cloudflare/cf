import operation from "../../../../../_operations/web3/hostnames/ipfs-universal-paths/content-lists/entries/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command:
				"web3 hostnames ipfs-universal-paths content-lists entries update",
			classification: {
				safeFlags: ["type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["content"] === undefined) {
					argv["content"] = await promptForRequiredField(
						"content",
						"Specify the CID or content path of content to block."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"Specify the type of content list entry to block.",
						["cid", "content_path"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command:
						"cf web3 hostnames ipfs-universal-paths content-lists entries update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/web3/hostnames/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/ipfs_universal_path/content_list/entries/${argv["content-list-entry-identifier"] == null ? "<content-list-entry-identifier>" : encodeURIComponent(String(argv["content-list-entry-identifier"]))}`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						identifier: String(argv["identifier"] ?? ""),
						"content-list-entry-identifier": String(
							argv["content-list-entry-identifier"] ?? ""
						),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									content: resolveFileToken(
										argv["content"] as string | undefined,
										"content",
										"text"
									),
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									type: argv["type"],
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

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						identifier: argv["identifier"],
						content_list_entry_identifier:
							argv["content-list-entry-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				content: resolveFileToken(
					argv["content"] as string | undefined,
					"content",
					"text"
				),
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				type: argv["type"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					zone_id: zoneId,
					identifier: argv["identifier"],
					content_list_entry_identifier: argv["content-list-entry-identifier"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
