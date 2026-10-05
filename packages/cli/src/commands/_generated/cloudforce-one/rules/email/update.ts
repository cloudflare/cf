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
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one rules email update <id>\n\nUpdates an existing structured email rule."
		)
		.positional("id", {
			type: "string",
			description: "The unique identifier for the rule.",
			demandOption: true,
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
		})
		.check((argv) => {
			const groupSet = ["condition-operator", "condition-type"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["condition-operator", "condition-type"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --condition-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"cloudforce-one-update-email-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <id>",
	describe: "Update an email rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one rules email update",
				classification: {
					safeFlags: [
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
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules email update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/structured/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
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
					const result = await withProgress(`Updating`, async () =>
						client.cloudforceOne.rules.email.update({
							...bodyData,
							account_id: accountId,
							id: argv["id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
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
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.rules.email.update({
						...bodyData,
						account_id: accountId,
						id: argv["id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
