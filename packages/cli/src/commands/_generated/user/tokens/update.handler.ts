import operation from "../../_operations/user/tokens/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "user tokens update",
			classification: {
				safeFlags: ["status", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "Token name.");
				}
				if (argv["policies"] === undefined) {
					throw new Error(
						"--policies is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf user tokens update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/user/tokens/${argv["token-id"] == null ? "<token-id>" : encodeURIComponent(String(argv["token-id"]))}`,
					pathParams: { "token-id": String(argv["token-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									condition: {
										request_ip: {
											in: argv["condition-request-ip-in"],
											not_in: argv["condition-request-ip-not-in"],
										},
									},
									expires_on: resolveFileToken(
										argv["expires-on"] as string | undefined,
										"expires-on",
										"text"
									),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									not_before: resolveFileToken(
										argv["not-before"] as string | undefined,
										"not-before",
										"text"
									),
									policies: parseObjectArray(argv["policies"], "policies"),
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
					client.send(operation, { body: bodyData, token_id: argv["token-id"] })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				condition: {
					request_ip: {
						in: argv["condition-request-ip-in"],
						not_in: argv["condition-request-ip-not-in"],
					},
				},
				expires_on: resolveFileToken(
					argv["expires-on"] as string | undefined,
					"expires-on",
					"text"
				),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				not_before: resolveFileToken(
					argv["not-before"] as string | undefined,
					"not-before",
					"text"
				),
				policies: parseObjectArray(argv["policies"], "policies"),
				status: argv["status"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, token_id: argv["token-id"] })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
