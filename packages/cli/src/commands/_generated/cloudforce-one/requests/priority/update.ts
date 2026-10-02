import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
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
			"$0 cloudforce-one requests priority update <priority-id>\n\nUpdates a priority intelligence request in Cloudforce One."
		)
		.positional("priority-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("labels", {
			type: "string",
			array: true,
			description: "List of labels.",
		})
		.option("priority", { type: "number", description: "Priority." })
		.option("requirement", { type: "string", description: "Requirement." })
		.option("tlp", {
			type: "string",
			description: "The CISA defined Traffic Light Protocol (TLP).",
			choices: ["clear", "amber", "amber-strict", "green", "red"],
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

type Request = SdkRequest<"cloudforce-one-priority-update">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <priority-id>",
	describe: "Update a Priority Intelligence Requirement",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests priority update",
				classification: {
					safeFlags: ["tlp", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests priority update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/requests/priority/${argv["priority-id"] == null ? "<priority-id>" : encodeURIComponent(String(argv["priority-id"]))}`,
						pathParams: { "priority-id": String(argv["priority-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										labels: argv["labels"],
										priority: argv["priority"],
										requirement: resolveFileToken(
											argv["requirement"] as string | undefined,
											"requirement",
											"text"
										),
										tlp: resolveFileToken(
											argv["tlp"] as string | undefined,
											"tlp",
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
					const result = await withProgress(`Updating`, async () =>
						client.cloudforceOne.requests.priority.update({
							body: bodyData,
							account_id: accountId,
							priority_id: argv["priority-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["labels"] === undefined) {
					throw new Error(
						"--labels is required (or pass --body with this field set)."
					);
				}
				if (argv["priority"] === undefined) {
					throw new Error(
						"--priority is required (or pass --body with this field set)."
					);
				}
				if (argv["requirement"] === undefined) {
					argv["requirement"] = await promptForRequiredField(
						"requirement",
						"Requirement."
					);
				}
				if (argv["tlp"] === undefined) {
					argv["tlp"] = await promptForRequiredEnumField(
						"tlp",
						"The CISA defined Traffic Light Protocol (TLP).",
						["clear", "amber", "amber-strict", "green", "red"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					labels: argv["labels"],
					priority: argv["priority"],
					requirement: resolveFileToken(
						argv["requirement"] as string | undefined,
						"requirement",
						"text"
					),
					tlp: resolveFileToken(
						argv["tlp"] as string | undefined,
						"tlp",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.requests.priority.update({
						body: bodyData,
						account_id: accountId,
						priority_id: argv["priority-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
