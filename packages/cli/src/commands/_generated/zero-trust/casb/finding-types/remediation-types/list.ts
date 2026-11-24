import operation from "../../../../_operations/zero-trust/casb/finding-types/remediation-types/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List remediation types for a finding type",
	usage:
		"$0 zero-trust casb finding-types remediation-types list\n\nList all remediation types for a given finding type. This endpoint supports both cursor and offset pagination. Note that `cursor` and `page` are mutually exclusive.",
	flags: {
		"finding-type-id": {
			kind: "parsed",
			brief: "A UUID string identifying the finding type.",
			parse: String,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by an integration ID",
			optional: true,
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief: "A cursor for pagination.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "A page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb finding-types remediation-types list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					integration_id: argv["integration-id"],
					cursor: argv["cursor"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb finding-types remediation-types list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/finding_types/${argv["finding-type-id"] == null ? "<finding-type-id>" : encodeURIComponent(String(argv["finding-type-id"]))}/remediation_types`,
						pathParams: {
							"finding-type-id": String(argv["finding-type-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						finding_type_id: argv["finding-type-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
