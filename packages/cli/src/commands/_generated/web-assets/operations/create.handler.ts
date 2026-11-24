import operation from "../../_operations/web-assets/operations/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
			command: "web-assets operations create",
			classification: {
				safeFlags: ["method", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["endpoint"] === undefined) {
					argv["endpoint"] = await promptForRequiredField(
						"endpoint",
						"The endpoint which can contain path parameter templates in curly braces, each will be replaced from left to right with {varN}, starting with {var1}, during insertion. This will further be Cloudflare-normalized upon insertion. See: https://developers.cloudflare.com/rules/normalization/how-it-works/."
					);
				}
				if (argv["host"] === undefined) {
					argv["host"] = await promptForRequiredField(
						"host",
						"RFC3986-compliant host."
					);
				}
				if (argv["method"] === undefined) {
					argv["method"] = await promptForRequiredEnumField(
						"method",
						"The HTTP method used to access the endpoint.",
						[
							"GET",
							"POST",
							"HEAD",
							"OPTIONS",
							"PUT",
							"DELETE",
							"CONNECT",
							"PATCH",
							"TRACE",
						] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf web-assets operations create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/operations/item`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									endpoint: resolveFileToken(
										argv["endpoint"] as string | undefined,
										"endpoint",
										"text"
									),
									host: resolveFileToken(
										argv["host"] as string | undefined,
										"host",
										"text"
									),
									method: argv["method"],
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
				endpoint: resolveFileToken(
					argv["endpoint"] as string | undefined,
					"endpoint",
					"text"
				),
				host: resolveFileToken(
					argv["host"] as string | undefined,
					"host",
					"text"
				),
				method: argv["method"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
