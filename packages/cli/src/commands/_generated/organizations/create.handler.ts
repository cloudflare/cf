import operation from "../_operations/organizations/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient } from "#lib/auth.js";
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
			command: "organizations create",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The Organization name, limited to 65 UTF-8 bytes."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf organizations create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/organizations`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									parent: {
										id: resolveFileToken(
											argv["parent-id"] as string | undefined,
											"parent-id",
											"text"
										),
									},
									profile: {
										business_address: resolveFileToken(
											argv["profile-business-address"] as string | undefined,
											"profile-business-address",
											"text"
										),
										business_email: resolveFileToken(
											argv["profile-business-email"] as string | undefined,
											"profile-business-email",
											"text"
										),
										business_name: resolveFileToken(
											argv["profile-business-name"] as string | undefined,
											"profile-business-name",
											"text"
										),
										business_phone: resolveFileToken(
											argv["profile-business-phone"] as string | undefined,
											"profile-business-phone",
											"text"
										),
										external_metadata: resolveFileToken(
											argv["profile-external-metadata"] as string | undefined,
											"profile-external-metadata",
											"text"
										),
									},
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
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				parent: {
					id: resolveFileToken(
						argv["parent-id"] as string | undefined,
						"parent-id",
						"text"
					),
				},
				profile: {
					business_address: resolveFileToken(
						argv["profile-business-address"] as string | undefined,
						"profile-business-address",
						"text"
					),
					business_email: resolveFileToken(
						argv["profile-business-email"] as string | undefined,
						"profile-business-email",
						"text"
					),
					business_name: resolveFileToken(
						argv["profile-business-name"] as string | undefined,
						"profile-business-name",
						"text"
					),
					business_phone: resolveFileToken(
						argv["profile-business-phone"] as string | undefined,
						"profile-business-phone",
						"text"
					),
					external_metadata: resolveFileToken(
						argv["profile-external-metadata"] as string | undefined,
						"profile-external-metadata",
						"text"
					),
				},
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
