import operation from "../../../_operations/zero-trust/casb/webhooks/evaluate.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./evaluate.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
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
			command: "zero-trust casb webhooks evaluate",
			classification: {
				safeFlags: ["authentication-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["authentication-type"] === undefined) {
					argv["authentication-type"] = await promptForRequiredEnumField(
						"authentication-type",
						"Type of authentication to use for the test webhook request.",
						[
							"Basic Auth",
							"None",
							"Bearer Auth",
							"Static Headers",
							"HMAC-Signing",
						] as const
					);
				}
				if (argv["destination-url"] === undefined) {
					argv["destination-url"] = await promptForRequiredField(
						"destination-url",
						"Target URL to send the test webhook event to."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust casb webhooks evaluate",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/webhooks/evaluate`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									authentication_type: argv["authentication-type"],
									destination_url: resolveFileToken(
										argv["destination-url"] as string | undefined,
										"destination-url",
										"text"
									),
									headers: parseObjectArray(argv["headers"], "headers"),
									signing_secret: resolveFileToken(
										argv["signing-secret"] as string | undefined,
										"signing-secret",
										"text"
									),
								}),
					sensitiveBodyPaths: [["signing_secret"]],
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
				authentication_type: argv["authentication-type"],
				destination_url: resolveFileToken(
					argv["destination-url"] as string | undefined,
					"destination-url",
					"text"
				),
				headers: parseObjectArray(argv["headers"], "headers"),
				signing_secret: resolveFileToken(
					argv["signing-secret"] as string | undefined,
					"signing-secret",
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
