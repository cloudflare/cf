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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dlp data-classes create\n\nCreates a data class for use in DLP profiles."
		)
		.option("data-tags", {
			type: "string",
			array: true,
			description: "The data_tags field",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("expression", {
			type: "string",
			description: "The expression field",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("sensitivity-levels", {
			type: "string",
			description:
				"The sensitivity_levels field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Attributes of the new data class.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dlp-data-classes-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Creates a new data class",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp data-classes create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp data-classes create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/data_classes`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										data_tags: argv["data-tags"],
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
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										sensitivity_levels: parseObjectArray(
											argv["sensitivity-levels"],
											"sensitivity-levels"
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
						client.zeroTrust.dlp.dataClasses.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["data-tags"] === undefined) {
					throw new Error(
						"--data-tags is required (or pass --body with this field set)."
					);
				}
				if (argv["expression"] === undefined) {
					argv["expression"] = await promptForRequiredField(
						"expression",
						"The expression field"
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}
				if (argv["sensitivity-levels"] === undefined) {
					throw new Error(
						"--sensitivity-levels is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					data_tags: argv["data-tags"],
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
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					sensitivity_levels: parseObjectArray(
						argv["sensitivity-levels"],
						"sensitivity-levels"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.dlp.dataClasses.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
