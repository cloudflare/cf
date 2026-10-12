import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * queue command
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 basin-catalog namespaces tables maintenance-configs queue <configuration-type>\n\nQueue maintenance for normal polling. This request does not start a run."
		)
		.positional("configuration-type", {
			type: "string",
			description: "Configuration type",
			demandOption: true,
		})
		.option("bucket-name", {
			type: "string",
			description: "Specifies the R2 bucket name.",
			demandOption: true,
		})
		.option("namespace", {
			type: "string",
			description: "Namespace",
			demandOption: true,
		})
		.option("table-name", {
			type: "string",
			description: "Table name",
			demandOption: true,
		})
		.option("request-id", {
			type: "string",
			description: "The request_id field",
		})
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

type Request = SdkRequest<"basin-queue-table-maintenance">;
type Body = Request["body"];

const typedBuilder = withArgTypes<
	{
		"configuration-type": Request["configuration_type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "queue <configuration-type>",
	describe: "Queue table maintenance",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "basin-catalog namespaces tables maintenance-configs queue",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf basin-catalog namespaces tables maintenance-configs queue",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/tables/${argv["table-name"] == null ? "<table-name>" : encodeURIComponent(String(argv["table-name"]))}/maintenance-configs/${argv["configuration-type"] == null ? "<configuration-type>" : encodeURIComponent(String(argv["configuration-type"]))}/queue`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							namespace: String(argv["namespace"] ?? ""),
							"table-name": String(argv["table-name"] ?? ""),
							"configuration-type": String(argv["configuration-type"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										request_id: resolveFileToken(
											argv["request-id"] as string | undefined,
											"request-id",
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.basinCatalog.namespaces.tables.maintenanceConfigs.queue({
							body: bodyData,
							account_id: accountId,
							bucket_name: argv["bucket-name"],
							namespace: argv["namespace"],
							table_name: argv["table-name"],
							configuration_type: argv["configuration-type"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					request_id: resolveFileToken(
						argv["request-id"] as string | undefined,
						"request-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.basinCatalog.namespaces.tables.maintenanceConfigs.queue({
						body: bodyData,
						account_id: accountId,
						bucket_name: argv["bucket-name"],
						namespace: argv["namespace"],
						table_name: argv["table-name"],
						configuration_type: argv["configuration-type"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
