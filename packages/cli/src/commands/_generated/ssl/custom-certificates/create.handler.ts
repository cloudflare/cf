import operation from "../../_operations/ssl/custom-certificates/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ssl custom-certificates create",
			classification: {
				safeFlags: [
					"bundle-method",
					"deploy",
					"geo-restrictions-label",
					"type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["certificate"] === undefined) {
					argv["certificate"] = await promptForRequiredField(
						"certificate",
						"The zone's SSL certificate or certificate and the intermediate(s)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf ssl custom-certificates create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_certificates`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									bundle_method: argv["bundle-method"],
									certificate: resolveFileToken(
										argv["certificate"] as string | undefined,
										"certificate",
										"text"
									),
									custom_csr_id: resolveFileToken(
										argv["custom-csr-id"] as string | undefined,
										"custom-csr-id",
										"text"
									),
									deploy: argv["deploy"],
									geo_restrictions: {
										label: argv["geo-restrictions-label"],
									},
									policy: resolveFileToken(
										argv["policy"] as string | undefined,
										"policy",
										"text"
									),
									private_key: resolveFileToken(
										argv["private-key"] as string | undefined,
										"private-key",
										"text"
									),
									type: argv["type"],
								}),
					sensitiveBodyPaths: [["private_key"]],
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
				bundle_method: argv["bundle-method"],
				certificate: resolveFileToken(
					argv["certificate"] as string | undefined,
					"certificate",
					"text"
				),
				custom_csr_id: resolveFileToken(
					argv["custom-csr-id"] as string | undefined,
					"custom-csr-id",
					"text"
				),
				deploy: argv["deploy"],
				geo_restrictions: {
					label: argv["geo-restrictions-label"],
				},
				policy: resolveFileToken(
					argv["policy"] as string | undefined,
					"policy",
					"text"
				),
				private_key: resolveFileToken(
					argv["private-key"] as string | undefined,
					"private-key",
					"text"
				),
				type: argv["type"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
