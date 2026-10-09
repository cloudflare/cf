import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/workflows.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workflows instances create <workflow-name>\n\nCreates a new instance of a workflow, starting its execution."
		)
		.positional("workflow-name", {
			type: "string",
			description: "Workflow name",
			demandOption: true,
		})
		.option("instance-id", {
			type: "string",
			description:
				"The system reserves IDs that consist of the `cf_` prefix and exactly 64 lowercase hexadecimal characters.",
		})
		.option("location-hint", {
			type: "string",
			description: "The location_hint field",
			choices: [
				"wnam",
				"weur",
				"enam",
				"eeur",
				"apac",
				"apac-ne",
				"apac-se",
				"oc",
				"sam",
				"afr",
				"me",
			],
		})
		.coerce("location-hint", (value) =>
			resolveFileToken(value, "location-hint", "text")
		)
		.option("params", {
			type: "string",
			description: "JSON-encoded event payload passed into the new instance.",
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

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"wor-create-new-workflow-instance">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <workflow-name>",
	describe: "Create a new workflow instance",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows instances create",
				classification: {
					safeFlags: ["location-hint", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/${argv["workflow-name"] == null ? "<workflow-name>" : encodeURIComponent(String(argv["workflow-name"]))}/instances`,
						pathParams: {
							"workflow-name": String(argv["workflow-name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										instance_id: resolveFileToken(
											argv["instance-id"] as string | undefined,
											"instance-id",
											"text"
										),
										location_hint: argv["location-hint"],
										params: resolveFileToken(
											argv["params"] as string | undefined,
											"params",
											"json"
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
					const result = await withProgress(`Creating`, async () =>
						client.workflows.instances.create({
							...bodyData,
							account_id: accountId,
							workflow_name: argv["workflow-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					instance_id: resolveFileToken(
						argv["instance-id"] as string | undefined,
						"instance-id",
						"text"
					),
					location_hint: argv["location-hint"],
					params: resolveFileToken(
						argv["params"] as string | undefined,
						"params",
						"json"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.workflows.instances.create({
						...bodyData,
						account_id: accountId,
						workflow_name: argv["workflow-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
