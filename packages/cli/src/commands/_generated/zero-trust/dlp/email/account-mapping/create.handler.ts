import operation from "../../../../_operations/zero-trust/dlp/email/account-mapping/create.js";
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["auth_requirements"],
		selector: "type",
		variants: [
			{
				values: ["Org"],
				schema: {
					type: "object",
					properties: {
						allowed_microsoft_organizations: {
							type: "array",
							items: { type: "string" },
						},
						type: { enum: ["Org"] },
					},
					required: ["allowed_microsoft_organizations", "type"],
					additionalProperties: false,
				},
			},
			{
				values: ["NoAuth"],
				schema: {
					type: "object",
					properties: { type: { enum: ["NoAuth"] } },
					required: ["type"],
					additionalProperties: false,
				},
			},
		],
	},
];

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust dlp email account-mapping create",
			classification: {
				safeFlags: ["auth-requirements-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["auth-requirements-type"] === undefined) {
					argv["auth-requirements-type"] = await promptForRequiredEnumField(
						"auth-requirements-type",
						"The auth_requirements.type field",
						["Org", "NoAuth"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust dlp email account-mapping create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/email/account_mapping`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: validateBodyUnions(
									compactBody({
										auth_requirements: {
											allowed_microsoft_organizations:
												argv[
													"auth-requirements-allowed-microsoft-organizations"
												],
											type: argv["auth-requirements-type"],
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
				auth_requirements: {
					allowed_microsoft_organizations:
						argv["auth-requirements-allowed-microsoft-organizations"],
					type: argv["auth-requirements-type"],
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
