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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one priority-intelligence update <priority-id>\n\nUpdates a free-form Priority Intelligence Requirement for the authenticated account."
		)
		.positional("priority-id", {
			type: "string",
			description: "Priority ID",
			demandOption: true,
		})
		.option("labels", {
			type: "string",
			array: true,
			description: "The labels field",
		})
		.option("priority", { type: "number", description: "The priority field" })
		.option("requirement", {
			type: "string",
			description: "The requirement field",
		})
		.option("tlp", { type: "string", description: "The tlp field" })
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

type Request = SdkRequest<"put_PirUpdate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <priority-id>",
	describe: "Update a priority intelligence requirement",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one priority-intelligence update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/${argv["priority-id"] == null ? "<priority-id>" : encodeURIComponent(String(argv["priority-id"]))}`,
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.cloudforceOne.priorityIntelligence.update({
							...bodyData,
							account_id: accountId,
							priority_id: argv["priority-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
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
					client.cloudforceOne.priorityIntelligence.update({
						...bodyData,
						account_id: accountId,
						priority_id: argv["priority-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
