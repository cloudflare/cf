import operation from "../../../_operations/zero-trust/casb/finding-types/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb finding-types create\n\nCreate a new custom finding type with policy definition."
		)
		.option("applies-to-all-integrations", {
			type: "boolean",
			description:
				"When true, this finding type applies to every current and future integration of the vendor.",
		})
		.option("asset-class", {
			type: "string",
			description:
				"Asset class this finding type applies to (PascalCase, e.g. GoogleWorkspaceFile)",
		})
		.option("asset-vendor", {
			type: "string",
			description: "Vendors whose assets a finding type can evaluate.",
			choices: [
				"ANTHROPIC",
				"AWS",
				"BITBUCKET",
				"BOX",
				"CONFLUENCE",
				"DROPBOX",
				"GITHUB",
				"GOOGLE_CLOUD_PLATFORM",
				"GOOGLE_WORKSPACE",
				"JIRA",
				"MICROSOFT",
				"OPENAI",
				"SALESFORCE",
				"SERVICENOW",
				"SLACK",
				"ZOOM",
			],
		})
		.coerce("asset-vendor", (value) =>
			resolveFileToken(value, "asset-vendor", "text")
		)
		.option("description", {
			type: "string",
			description:
				"Human-readable description of the finding type. Cannot be empty. Maximum 4096 characters.",
		})
		.option("expression", {
			type: "string",
			description:
				"Rego expression body for the policy. `package cloudflare.casb.custom` and `import rego.v1` are added automatically. Do not include package or import declarations. This field cannot be changed after creation. Maximum 4096 characters.",
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
				"Human-readable name for the finding type. Maximum 256 characters.",
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
	command: "create",
	describe: "Create a custom finding type",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb finding-types create",
				classification: {
					safeFlags: [
						"applies-to-all-integrations",
						"asset-vendor",
						"severity",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb finding-types create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/finding_types`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										applies_to_all_integrations:
											argv["applies-to-all-integrations"],
										asset_class: resolveFileToken(
											argv["asset-class"] as string | undefined,
											"asset-class",
											"text"
										),
										asset_vendor: argv["asset-vendor"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										expression: resolveFileToken(
											argv["expression"] as string | undefined,
											"expression",
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["applies-to-all-integrations"] === undefined) {
					throw new Error(
						"--applies-to-all-integrations is required (or pass --body with this field set)."
					);
				}
				if (argv["asset-class"] === undefined) {
					argv["asset-class"] = await promptForRequiredField(
						"asset-class",
						"Asset class this finding type applies to (PascalCase, e.g. GoogleWorkspaceFile)"
					);
				}
				if (argv["asset-vendor"] === undefined) {
					argv["asset-vendor"] = await promptForRequiredEnumField(
						"asset-vendor",
						"Vendors whose assets a finding type can evaluate.",
						[
							"ANTHROPIC",
							"AWS",
							"BITBUCKET",
							"BOX",
							"CONFLUENCE",
							"DROPBOX",
							"GITHUB",
							"GOOGLE_CLOUD_PLATFORM",
							"GOOGLE_WORKSPACE",
							"JIRA",
							"MICROSOFT",
							"OPENAI",
							"SALESFORCE",
							"SERVICENOW",
							"SLACK",
							"ZOOM",
						] as const
					);
				}
				if (argv["description"] === undefined) {
					argv["description"] = await promptForRequiredField(
						"description",
						"Human-readable description of the finding type. Cannot be empty. Maximum 4096 characters."
					);
				}
				if (argv["expression"] === undefined) {
					argv["expression"] = await promptForRequiredField(
						"expression",
						"Rego expression body for the policy. \`package cloudflare.casb.custom\` and \`import rego.v1\` are added automatically. Do not include package or import declarations. This field cannot be changed after creation. Maximum 4096 characters."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Human-readable name for the finding type. Maximum 256 characters."
					);
				}
				if (argv["severity"] === undefined) {
					argv["severity"] = await promptForRequiredEnumField(
						"severity",
						"The severity level of a finding.",
						["Critical", "High", "Medium", "Low"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					applies_to_all_integrations: argv["applies-to-all-integrations"],
					asset_class: resolveFileToken(
						argv["asset-class"] as string | undefined,
						"asset-class",
						"text"
					),
					asset_vendor: argv["asset-vendor"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					expression: resolveFileToken(
						argv["expression"] as string | undefined,
						"expression",
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
