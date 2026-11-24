import operation from "../../_operations/ssl/mtls-certificates/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ssl mtls-certificates create",
			classification: {
				safeFlags: ["ca", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["ca"] === undefined) {
					throw new Error(
						"--ca is required (or pass --body with this field set)."
					);
				}
				if (argv["certificates"] === undefined) {
					argv["certificates"] = await promptForRequiredField(
						"certificates",
						"The uploaded root CA certificate. Responses return the certificates as Cloudflare stores them, re-encoded as PEM, not byte for byte as uploaded. Each certificate block ends with a newline, base64 lines are wrapped at 64 characters, text between blocks is dropped, and a chain may be reordered. Compare certificates by their decoded content rather than as strings."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ssl mtls-certificates create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/mtls_certificates`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									ca: argv["ca"],
									certificates: resolveFileToken(
										argv["certificates"] as string | undefined,
										"certificates",
										"text"
									),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									private_key: resolveFileToken(
										argv["private-key"] as string | undefined,
										"private-key",
										"text"
									),
								}),
					sensitiveBodyPaths: [["private_key"]],
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				ca: argv["ca"],
				certificates: resolveFileToken(
					argv["certificates"] as string | undefined,
					"certificates",
					"text"
				),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				private_key: resolveFileToken(
					argv["private-key"] as string | undefined,
					"private-key",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
