import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * patch command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events dataset indicators patch <indicator-id>\n\nUpdates an existing indicator's properties."
		)
		.positional("indicator-id", {
			type: "string",
			description: "Indicator UUID.",
			demandOption: true,
		})
		.option("dataset-id", {
			type: "string",
			description: "Dataset ID.",
			demandOption: true,
		})
		.option("indicator-type", {
			type: "string",
			description: "The indicatorType field",
		})
		.option("related-events", {
			type: "string",
			description:
				"The relatedEvents field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("tlp", {
			type: "string",
			description:
				"Traffic Light Protocol designation. Case-insensitive on input, stored and returned as UPPERCASE. Allowed values: clear, green, amber, amber-strict, red, purple.",
		})
		.option("value", { type: "string", description: "The value field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"patch_IndicatorUpdate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "patch <indicator-id>",
	describe: "Updates an indicator",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events dataset indicators patch",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events dataset indicators patch",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/indicators/${argv["indicator-id"] == null ? "<indicator-id>" : encodeURIComponent(String(argv["indicator-id"]))}`,
						pathParams: {
							"dataset-id": String(argv["dataset-id"] ?? ""),
							"indicator-id": String(argv["indicator-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										indicatorType: resolveFileToken(
											argv["indicator-type"] as string | undefined,
											"indicator-type",
											"text"
										),
										relatedEvents: parseObjectArray(
											argv["related-events"],
											"related-events"
										),
										tlp: resolveFileToken(
											argv["tlp"] as string | undefined,
											"tlp",
											"text"
										),
										value: resolveFileToken(
											argv["value"] as string | undefined,
											"value",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.cloudforceOne.events.dataset.indicators.patch({
							...bodyData,
							account_id: accountId,
							dataset_id: argv["dataset-id"],
							indicator_id: argv["indicator-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					indicatorType: resolveFileToken(
						argv["indicator-type"] as string | undefined,
						"indicator-type",
						"text"
					),
					relatedEvents: parseObjectArray(
						argv["related-events"],
						"related-events"
					),
					tlp: resolveFileToken(
						argv["tlp"] as string | undefined,
						"tlp",
						"text"
					),
					value: resolveFileToken(
						argv["value"] as string | undefined,
						"value",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.events.dataset.indicators.patch({
						...bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
						indicator_id: argv["indicator-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
