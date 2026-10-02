import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
			"$0 zero-trust access policies create\n\nCreates a new Access reusable policy."
		)
		.option("decision", {
			type: "string",
			description:
				"The action Access will take if a user matches this policy. Infrastructure application policies can only use the Allow action.",
			choices: ["allow", "deny", "non_identity", "bypass"],
		})
		.option("exclude", {
			type: "string",
			description:
				"Rules evaluated with a NOT logical operator. To match the policy, a user cannot meet any of the Exclude rules. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("include", {
			type: "string",
			description:
				"Rules evaluated with an OR logical operator. A user needs to meet only one of the Include rules. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("name", {
			type: "string",
			description: "The name of the Access policy.",
		})
		.option("require", {
			type: "string",
			description:
				"Rules evaluated with an AND logical operator. To match the policy, a user must meet all of the Require rules. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"access-policies-create-an-access-reusable-policy">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create an Access reusable policy",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access policies create",
				classification: {
					safeFlags: ["decision", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access policies create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/policies`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										decision: resolveFileToken(
											argv["decision"] as string | undefined,
											"decision",
											"text"
										),
										exclude: parseObjectArray(argv["exclude"], "exclude"),
										include: parseObjectArray(argv["include"], "include"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										require: parseObjectArray(argv["require"], "require"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.zeroTrust.access.policies.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["decision"] === undefined) {
					argv["decision"] = await promptForRequiredEnumField(
						"decision",
						"The action Access will take if a user matches this policy. Infrastructure application policies can only use the Allow action.",
						["allow", "deny", "non_identity", "bypass"] as const
					);
				}
				if (argv["include"] === undefined) {
					throw new Error(
						"--include is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the Access policy."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					decision: resolveFileToken(
						argv["decision"] as string | undefined,
						"decision",
						"text"
					),
					exclude: parseObjectArray(argv["exclude"], "exclude"),
					include: parseObjectArray(argv["include"], "include"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					require: parseObjectArray(argv["require"], "require"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.access.policies.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
