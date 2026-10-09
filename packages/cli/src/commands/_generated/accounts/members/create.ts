import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/accounts.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts members create\n\nAdd a user to the list of members for this account."
		)
		.option("email", {
			type: "string",
			description: "The contact email address of the user.",
		})
		.option("roles", {
			type: "string",
			array: true,
			description: "Array of roles associated with this member.",
		})
		.option("status", {
			type: "string",
			description:
				"Status of the member invitation. If not provided during creation, defaults to 'pending'.\nChanging from 'accepted' back to 'pending' will trigger a replacement of the member resource in Terraform.\n",
			choices: ["accepted", "pending"],
		})
		.coerce("status", (value: string | undefined) =>
			resolveFileToken(value, "status", "text")
		)
		.option("policies", {
			type: "string",
			description:
				"Array of policies associated with this member. Provide as a JSON array of objects or @path/to/file.json.",
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
		.conflicts("roles", ["policies"])
		.conflicts("policies", ["roles"]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"account-members-add-member">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Add Member",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts members create",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts members create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/members`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										email: resolveFileToken(
											argv["email"] as string | undefined,
											"email",
											"text"
										),
										roles: argv["roles"],
										status: argv["status"],
										policies: parseObjectArray(argv["policies"], "policies"),
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
						client.accounts.members.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["email"] === undefined) {
					argv["email"] = await promptForRequiredField(
						"email",
						"The contact email address of the user."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					email: resolveFileToken(
						argv["email"] as string | undefined,
						"email",
						"text"
					),
					roles: argv["roles"],
					status: argv["status"],
					policies: parseObjectArray(argv["policies"], "policies"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.accounts.members.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
