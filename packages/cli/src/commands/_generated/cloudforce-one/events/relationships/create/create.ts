import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one events relationships create create\n\nCreates a directed relationship between two events. The relationship is from parent to child with a specified type."
		)
		.option("child-ids", {
			type: "string",
			array: true,
			description:
				"Array of UUIDs for child events. Single child = 1:1 relationship, multiple = 1:many relationships",
		})
		.option("dataset-id", {
			type: "string",
			description: "Dataset identifier where the events are stored",
		})
		.option("parent-id", {
			type: "string",
			description:
				"UUID of the parent event that will be the source of the relationship",
		})
		.option("relationship-type", {
			type: "string",
			description:
				"Type of relationship to create between parent and child events",
			choices: ["related_to", "caused_by", "attributed_to"],
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

type Request = SdkRequest<"post_CreateEventRelationship">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a relationship between two events",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events relationships create create",
				classification: {
					safeFlags: ["relationship-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events relationships create create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/relationships/create`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										childIds: argv["child-ids"],
										datasetId: resolveFileToken(
											argv["dataset-id"] as string | undefined,
											"dataset-id",
											"text"
										),
										parentId: resolveFileToken(
											argv["parent-id"] as string | undefined,
											"parent-id",
											"text"
										),
										relationshipType: resolveFileToken(
											argv["relationship-type"] as string | undefined,
											"relationship-type",
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
					const result = await withProgress(`Creating`, async () =>
						client.cloudforceOne.events.relationships.create.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["child-ids"] === undefined) {
					throw new Error(
						"--child-ids is required (or pass --body with this field set)."
					);
				}
				if (argv["dataset-id"] === undefined) {
					argv["dataset-id"] = await promptForRequiredField(
						"dataset-id",
						"Dataset identifier where the events are stored"
					);
				}
				if (argv["parent-id"] === undefined) {
					argv["parent-id"] = await promptForRequiredField(
						"parent-id",
						"UUID of the parent event that will be the source of the relationship"
					);
				}
				if (argv["relationship-type"] === undefined) {
					argv["relationship-type"] = await promptForRequiredEnumField(
						"relationship-type",
						"Type of relationship to create between parent and child events",
						["related_to", "caused_by", "attributed_to"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					childIds: argv["child-ids"],
					datasetId: resolveFileToken(
						argv["dataset-id"] as string | undefined,
						"dataset-id",
						"text"
					),
					parentId: resolveFileToken(
						argv["parent-id"] as string | undefined,
						"parent-id",
						"text"
					),
					relationshipType: resolveFileToken(
						argv["relationship-type"] as string | undefined,
						"relationship-type",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.events.relationships.create.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
