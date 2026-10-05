import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * updatePendingApproval command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one rules email updatePendingApproval <id>\n\nValidate, compile, and replace the proposed structured email rule on a pending approval. Only the original requester may update it."
		)
		.positional("id", {
			type: "string",
			description: "The unique identifier for the approval.",
			demandOption: true,
		})
		.option("module", {
			type: "string",
			description: "Structured rule module.",
			choices: ["eml"],
		})
		.option("condition-operator", {
			type: "string",
			description: "The condition.operator field",
			choices: ["and", "or"],
		})
		.option("condition-type", {
			type: "string",
			description: "The condition.type field",
			choices: ["group"],
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("enabled", { type: "boolean", description: "The enabled field" })
		.option("meta", {
			type: "string",
			description:
				"The meta field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("status", {
			type: "string",
			description:
				"Disposition for matching email. This emits status metadata with the selected value.",
			choices: ["silent", "blocking"],
		})
		.option("strings", {
			type: "string",
			description:
				"The strings field. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"cloudforce-one-update-pending-email-rule-approval">;
type Body = Request;
type Query = SdkQuery<"cloudforce-one-update-pending-email-rule-approval">;

const typedBuilder = withArgTypes<
	{
		module: Query["module"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "updatePendingApproval <id>",
	describe: "Update a pending structured email rule approval",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one rules email updatePendingApproval",
				classification: {
					safeFlags: [
						"module",
						"condition-operator",
						"condition-type",
						"enabled",
						"status",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					module: argv["module"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules email updatePendingApproval",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/structured/approvals/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										condition: {
											operator: resolveFileToken(
												argv["condition-operator"] as string | undefined,
												"condition-operator",
												"text"
											),
											type: resolveFileToken(
												argv["condition-type"] as string | undefined,
												"condition-type",
												"text"
											),
										},
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										meta: parseObjectArray(argv["meta"], "meta"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										status: resolveFileToken(
											argv["status"] as string | undefined,
											"status",
											"text"
										),
										strings: parseObjectArray(argv["strings"], "strings"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						client.cloudforceOne.rules.email.updatePendingApproval({
							...bodyData,
							account_id: accountId,
							id: argv["id"],
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["condition-operator"] === undefined) {
					argv["condition-operator"] = await promptForRequiredEnumField(
						"condition-operator",
						"The condition.operator field",
						["and", "or"] as const
					);
				}
				if (argv["condition-type"] === undefined) {
					argv["condition-type"] = await promptForRequiredEnumField(
						"condition-type",
						"The condition.type field",
						["group"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					condition: {
						operator: resolveFileToken(
							argv["condition-operator"] as string | undefined,
							"condition-operator",
							"text"
						),
						type: resolveFileToken(
							argv["condition-type"] as string | undefined,
							"condition-type",
							"text"
						),
					},
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					meta: parseObjectArray(argv["meta"], "meta"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					status: resolveFileToken(
						argv["status"] as string | undefined,
						"status",
						"text"
					),
					strings: parseObjectArray(argv["strings"], "strings"),
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.rules.email.updatePendingApproval({
						...bodyData,
						account_id: accountId,
						id: argv["id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
