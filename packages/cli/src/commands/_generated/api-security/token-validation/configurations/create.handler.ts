import operation from "../../../_operations/api-security/token-validation/configurations/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
			command: "api-security token-validation configurations create",
			classification: {
				safeFlags: ["token-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["credentials-keys"] === undefined) {
					throw new Error(
						"--credentials-keys is required (or pass --body with this field set)."
					);
				}
				if (argv["description"] === undefined) {
					argv["description"] = await promptForRequiredField(
						"description",
						"The description field"
					);
				}
				if (argv["title"] === undefined) {
					argv["title"] = await promptForRequiredField(
						"title",
						"The title field"
					);
				}
				if (argv["token-type"] === undefined) {
					argv["token-type"] = await promptForRequiredEnumField(
						"token-type",
						"The token_type field",
						["JWT"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf api-security token-validation configurations create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/token_validation/config`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									credentials: {
										keys: parseObjectArray(
											argv["credentials-keys"],
											"credentials-keys"
										),
									},
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									title: resolveFileToken(
										argv["title"] as string | undefined,
										"title",
										"text"
									),
									token_type: argv["token-type"],
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				credentials: {
					keys: parseObjectArray(argv["credentials-keys"], "credentials-keys"),
				},
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				title: resolveFileToken(
					argv["title"] as string | undefined,
					"title",
					"text"
				),
				token_type: argv["token-type"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
