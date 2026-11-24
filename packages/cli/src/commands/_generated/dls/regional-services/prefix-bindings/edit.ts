import operation from "../../../_operations/dls/regional-services/prefix-bindings/edit.js";
/**
 * edit command
 * @generated from apis/overlays/dls.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "edit <binding-id>",
	describe: "Update a DLS prefix binding",
	usage:
		"$0 dls regional-services prefix-bindings edit <binding-id>\n\nUpdate the region of an existing BYOIP prefix binding. Like creating a binding, this requires **IP Prefixes Write** in addition to **DLS Write**.",
	flags: {
		"region-key": {
			kind: "parsed",
			brief: 'New region key to assign (e.g., "us", "eu", "cfcanary").',
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "binding-id",
			brief: "Unique identifier for the prefix binding.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dls regional-services prefix-bindings edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["region-key"] === undefined) {
						argv["region-key"] = await promptForRequiredField(
							"region-key",
							'New region key to assign (e.g., "us", "eu", "cfcanary").'
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dls regional-services prefix-bindings edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dls/regional_services/prefix_bindings/${argv["binding-id"] == null ? "<binding-id>" : encodeURIComponent(String(argv["binding-id"]))}`,
						pathParams: { "binding-id": String(argv["binding-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										region_key: resolveFileToken(
											argv["region-key"] as string | undefined,
											"region-key",
											"text"
										),
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							binding_id: argv["binding-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					region_key: resolveFileToken(
						argv["region-key"] as string | undefined,
						"region-key",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						binding_id: argv["binding-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
