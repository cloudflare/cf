import operation from "../_operations/resource-sharing/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/resource-sharing.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 resource-sharing create\n\nCreates a share that makes a resource available to specific accounts in the caller's organization, or to the whole organization."
		)
		.option("excluded-recipients", {
			type: "string",
			description:
				'Accounts to exclude from an organization-targeted share. Only allowed when `recipients` contains no account entries. The share owner cannot be excluded. Duplicate entries are ignored. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"account_id": string}].',
		})
		.option("name", { type: "string", description: "The name of the share." })
		.option("recipients", {
			type: "string",
			description:
				'The recipients field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"account_id"?: string, "organization_id"?: string, "recipient_account_id"?: string}]. ? marks optional keys.',
		})
		.option("resources", {
			type: "string",
			description:
				'The resources field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"meta": {...}, "resource_account_id": string, "resource_id": string, "resource_type": "custom-ruleset" | "gateway-policy" | "gateway-destination-ip" | ...more}].',
		})
		.option("tags", {
			type: "string",
			description:
				'Tags associated with the share. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Trigger a share creation",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											excluded_recipients: parseObjectArray(
												argv["excluded-recipients"],
												"excluded-recipients"
											),
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											recipients: parseObjectArray(
												argv["recipients"],
												"recipients"
											),
											resources: parseObjectArray(
												argv["resources"],
												"resources"
											),
											tags: parseJsonMap(argv["tags"], "tags"),
										},
										[["tags"]]
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
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the share."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						excluded_recipients: parseObjectArray(
							argv["excluded-recipients"],
							"excluded-recipients"
						),
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						recipients: parseObjectArray(argv["recipients"], "recipients"),
						resources: parseObjectArray(argv["resources"], "resources"),
						tags: parseJsonMap(argv["tags"], "tags"),
					},
					[["tags"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
