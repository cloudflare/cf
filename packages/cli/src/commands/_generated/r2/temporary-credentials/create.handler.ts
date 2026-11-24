import operation from "../../_operations/r2/temporary-credentials/create.js";
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
			command: "r2 temporary-credentials create",
			classification: {
				safeFlags: ["permission", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["bucket"] === undefined) {
					argv["bucket"] = await promptForRequiredField(
						"bucket",
						"Name of the R2 bucket."
					);
				}
				if (argv["parent-access-key-id"] === undefined) {
					argv["parent-access-key-id"] = await promptForRequiredField(
						"parent-access-key-id",
						"Access key ID of the parent R2 API token. The temporary credentials cannot exceed this token's permissions."
					);
				}
				if (argv["ttl-seconds"] === undefined) {
					throw new Error(
						"--ttl-seconds is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf r2 temporary-credentials create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/temp-access-credentials`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									actions: argv["actions"],
									bucket: resolveFileToken(
										argv["bucket"] as string | undefined,
										"bucket",
										"text"
									),
									objects: argv["objects"],
									parentAccessKeyId: resolveFileToken(
										argv["parent-access-key-id"] as string | undefined,
										"parent-access-key-id",
										"text"
									),
									permission: argv["permission"],
									prefixes: argv["prefixes"],
									ttlSeconds: argv["ttl-seconds"],
								}),
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
				actions: argv["actions"],
				bucket: resolveFileToken(
					argv["bucket"] as string | undefined,
					"bucket",
					"text"
				),
				objects: argv["objects"],
				parentAccessKeyId: resolveFileToken(
					argv["parent-access-key-id"] as string | undefined,
					"parent-access-key-id",
					"text"
				),
				permission: argv["permission"],
				prefixes: argv["prefixes"],
				ttlSeconds: argv["ttl-seconds"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
