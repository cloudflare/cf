import operation from "../../_operations/ssl/origin-ca-certificates/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient } from "#lib/auth.js";
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
			command: "ssl origin-ca-certificates create",
			classification: {
				safeFlags: ["request-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["csr"] === undefined) {
					argv["csr"] = await promptForRequiredField(
						"csr",
						"The Certificate Signing Request (CSR). Must be newline-encoded."
					);
				}
				if (argv["hostnames"] === undefined) {
					throw new Error(
						"--hostnames is required (or pass --body with this field set)."
					);
				}
				if (argv["request-type"] === undefined) {
					argv["request-type"] = await promptForRequiredEnumField(
						"request-type",
						'Signature type desired on certificate ("origin-rsa" (rsa), "origin-ecc" (ecdsa), or "keyless-certificate" (for Keyless SSL servers).',
						["origin-rsa", "origin-ecc", "keyless-certificate"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf ssl origin-ca-certificates create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/certificates`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									csr: resolveFileToken(
										argv["csr"] as string | undefined,
										"csr",
										"text"
									),
									hostnames: argv["hostnames"],
									request_type: argv["request-type"],
									requested_validity: argv["requested-validity"],
									zone_id: resolveFileToken(
										argv["zone-id"] as string | undefined,
										"zone-id",
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				csr: resolveFileToken(argv["csr"] as string | undefined, "csr", "text"),
				hostnames: argv["hostnames"],
				request_type: argv["request-type"],
				requested_validity: argv["requested-validity"],
				zone_id: resolveFileToken(
					argv["zone-id"] as string | undefined,
					"zone-id",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
