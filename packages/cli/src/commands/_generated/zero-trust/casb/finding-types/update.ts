import operation from "../../../_operations/zero-trust/casb/finding-types/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
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
			"$0 zero-trust casb finding-types update <finding-type-id>\n\nUpdate an existing custom finding type. **Immutable fields**: asset_vendor, asset_class, expression, and category cannot be changed after creation. **Security**: Only custom finding types (not system-managed) can be updated."
		)
		.positional("finding-type-id", {
			type: "string",
			description: "A UUID string identifying the finding type.",
			demandOption: true,
		})
		.option("applies-to-all-integrations", {
			type: "boolean",
			description:
				"When true, this finding type applies to every current and future integration of the vendor.",
		})
		.option("description", {
			type: "string",
			description:
				"Optional description of the finding type. Cannot be empty if provided. Maximum 4096 characters.",
		})
		.option("integration-ids", {
			type: "string",
			array: true,
			description:
				"Required and non-empty when applies_to_all_integrations is false; omit when it is true.",
		})
		.option("name", {
			type: "string",
			description:
				"Human-readable name for the finding type. Cannot be empty if provided. Maximum 256 characters.",
		})
		.option("severity", {
			type: "string",
			description: "The severity level of a finding.",
			choices: ["Critical", "High", "Medium", "Low"],
		})
		.coerce("severity", (value) => resolveFileToken(value, "severity", "text"))
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
	command: "update <finding-type-id>",
	describe: "Update a custom finding type",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb finding-types update",
				classification: {
					safeFlags: ["applies-to-all-integrations", "severity", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb finding-types update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/finding_types/${argv["finding-type-id"] == null ? "<finding-type-id>" : encodeURIComponent(String(argv["finding-type-id"]))}`,
						pathParams: {
							"finding-type-id": String(argv["finding-type-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										applies_to_all_integrations:
											argv["applies-to-all-integrations"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										integration_ids: argv["integration-ids"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										severity: argv["severity"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							finding_type_id: argv["finding-type-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["applies-to-all-integrations"] === undefined) {
					throw new Error(
						"--applies-to-all-integrations is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					applies_to_all_integrations: argv["applies-to-all-integrations"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					integration_ids: argv["integration-ids"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					severity: argv["severity"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						finding_type_id: argv["finding-type-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
