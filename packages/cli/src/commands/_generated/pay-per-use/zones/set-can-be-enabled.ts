import operation from "../../_operations/pay-per-use/zones/set-can-be-enabled.js";
/**
 * set-can-be-enabled command
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "set-can-be-enabled",
	describe: "Set pay-per-use zone eligibility",
	usage:
		"$0 pay-per-use zones set-can-be-enabled\n\nSets pay-per-use eligibility for a list of account zones. An omitted can_be_enabled value leaves that zone unchanged. Revoking eligibility disables the zone immediately while existing accepted licenses remain active until the start of the next UTC month.",
	flags: {
		zones: {
			kind: "parsed",
			brief:
				'The zones field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string, "can_be_enabled"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Pay-per-use zone eligibility updates",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-use zones set-can-be-enabled",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["zones"] === undefined) {
						throw new Error(
							"--zones is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pay-per-use zones set-can-be-enabled",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pay-per-use/zones_can_be_enabled`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										zones: parseObjectArray(argv["zones"], "zones"),
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					zones: parseObjectArray(argv["zones"], "zones"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
