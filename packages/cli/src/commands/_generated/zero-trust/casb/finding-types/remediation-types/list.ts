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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb finding-types remediation-types list\n\nList all remediation types for a given finding type. This endpoint supports both cursor and offset pagination. Note that `cursor` and `page` are mutually exclusive."
		)
		.option("finding-type-id", {
			type: "string",
			description: "A UUID string identifying the finding type.",
			demandOption: true,
		})
		.option("integration-id", {
			type: "string",
			description: "Filter by an integration ID",
		})
		.option("cursor", {
			type: "string",
			description: "A cursor for pagination.",
		})
		.option("page", {
			type: "number",
			description: "A page number within the paginated result set.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results to return per page.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"GetRemediationTypesForFindingType">;
type Query = SdkQuery<"GetRemediationTypesForFindingType">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List remediation types for a finding type",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb finding-types remediation-types list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.zeroTrust.casb.findingTypes.remediationTypes.list({
						account_id: accountId,
						finding_type_id: argv["finding-type-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
