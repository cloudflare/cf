import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * datasets command
 * @generated from apis/overlays/sql.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 sql datasets\n\nReturns the analytics dataset catalogue. By default, the response contains dataset names, titles, categories, descriptions, kinds, and hidden flags. Set `include_columns` to include each dataset's column names, descriptions, data types, and hidden flags. The caller must have Account Analytics Read permission on the account identified by `account_tag`. Dataset names, descriptions, and columns are the same for every authorized account. When `include_custom_attributes` or `include_attributes` is set, the response also includes attribute names and types discovered from that account's own data, which legitimately differs per caller. `attributes` is a replacement for `custom_attributes` that will eventually be removed; until then, set either flag independently to receive the corresponding field. `hidden` marks catalogue entries a client should de-emphasise. It has no effect on access: hidden datasets and columns are returned here and remain fully queryable. The catalogue lists the datasets this deployment is able to describe, which is not a fixed list. Some datasets are described by the service that owns them and are listed only where that service is available, so the same account may see a different catalogue in different environments, and datasets may appear or disappear without a change to this API. Clients should query the catalogue rather than hard-coding it, and should not treat a dataset's absence as proof that it does not exist. Workers Analytics Engine datasets are named by the account that writes them, so they are discovered from that account's own data rather than from a fixed list. They appear as `events.analyticsEngine.<dataset_name>` and differ per account. A dataset is listed for as long as any of its data is retained, so it does not disappear from the catalogue merely because writes have stopped. An account with a very large number of datasets may receive a truncated list. Set `include_wae=false` to omit them. Log Explorer datasets are listed only where the account has them, so they differ per account and are not part of the static catalogue. Set `include_lex=false` to omit them."
		)
		.option("account-tag", {
			type: "string",
			description: "Account whose available analytics datasets are returned.",
			demandOption: true,
		})
		.option("include-columns", {
			type: "boolean",
			description: "Include column metadata for each returned dataset.",
		})
		.option("include-custom-attributes", {
			type: "boolean",
			description:
				"Include a capped set of custom attribute names and types observed during the preceding seven days, as `custom_attributes`. Requires a nonempty dataset_name. Deprecated in favor of `include_attributes`.",
		})
		.option("include-attributes", {
			type: "boolean",
			description:
				"Include a capped set of attribute names and types observed during the preceding seven days, as `attributes`. Requires a nonempty dataset_name. Replaces `include_custom_attributes`, which is deprecated.",
		})
		.option("include-wae", {
			type: "boolean",
			description:
				"Include Workers Analytics Engine datasets, which are discovered from the account's own data. Set to `false` to return only datasets described from the static catalogue, which avoids that lookup.",
		})
		.option("include-lex", {
			type: "boolean",
			description:
				"Include Log Explorer datasets, which are listed only where the account has them. Set to `false` to return only datasets described from the static catalogue, which avoids that lookup.",
		})
		.option("dataset-name", {
			type: "string",
			description:
				"Return only the dataset with this exact name. An empty value is treated as if the parameter had been omitted, and does not filter the catalogue. A name that matches no dataset in this deployment's catalogue is rejected with `422`; a dataset that exists but is not describable here is rejected identically, so the two cases cannot be told apart.\n\nA Workers Analytics Engine dataset is named in full, as `events.analyticsEngine.<dataset_name>`; the namespace on its own returns every such dataset the account has. A `dataset_name` the account does not have is rejected with `422` like any other unknown name.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Query = SdkQuery<"sql-api-introspection">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "datasets",
	describe: "List available analytics datasets",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "sql datasets",
				classification: {
					safeFlags: [
						"include-columns",
						"include-custom-attributes",
						"include-attributes",
						"include-wae",
						"include-lex",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					account_tag: argv["account-tag"],
					include_columns: argv["include-columns"],
					include_custom_attributes: argv["include-custom-attributes"],
					include_attributes: argv["include-attributes"],
					include_wae: argv["include-wae"],
					include_lex: argv["include-lex"],
					dataset_name: argv["dataset-name"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf sql datasets",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/analytics/sql/introspection`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.sql.datasets(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
