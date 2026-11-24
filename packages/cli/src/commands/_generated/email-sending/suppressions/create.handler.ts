import operation from "../../_operations/email-sending/suppressions/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { validateBodyUnions } from "#lib/body-unions.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["scope"],
		selector: "type",
		variants: [
			{
				values: ["account"],
				schema: {
					type: "object",
					properties: { type: { enum: ["account"] } },
					required: ["type"],
					additionalProperties: false,
				},
			},
			{
				values: ["sending_domain"],
				schema: {
					type: "object",
					properties: {
						type: { enum: ["sending_domain"] },
						value: { type: "string" },
					},
					required: ["type", "value"],
					additionalProperties: false,
				},
			},
		],
	},
];

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "email-sending suppressions create",
			classification: {
				safeFlags: ["scope-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["email"] === undefined) {
					argv["email"] = await promptForRequiredField(
						"email",
						"The email address to suppress."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-sending suppressions create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/sending/suppressions`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: validateBodyUnions(
									compactBody({
										email: resolveFileToken(
											argv["email"] as string | undefined,
											"email",
											"text"
										),
										expires_at: resolveFileToken(
											argv["expires-at"] as string | undefined,
											"expires-at",
											"text"
										),
										note: resolveFileToken(
											argv["note"] as string | undefined,
											"note",
											"text"
										),
										scope: {
											type: argv["scope-type"],
											value: resolveFileToken(
												argv["scope-value"] as string | undefined,
												"scope-value",
												"text"
											),
										},
									}),
									bodyUnions
								),
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
				email: resolveFileToken(
					argv["email"] as string | undefined,
					"email",
					"text"
				),
				expires_at: resolveFileToken(
					argv["expires-at"] as string | undefined,
					"expires-at",
					"text"
				),
				note: resolveFileToken(
					argv["note"] as string | undefined,
					"note",
					"text"
				),
				scope: {
					type: argv["scope-type"],
					value: resolveFileToken(
						argv["scope-value"] as string | undefined,
						"scope-value",
						"text"
					),
				},
			});
			validateBodyUnions(bodyData, bodyUnions);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
