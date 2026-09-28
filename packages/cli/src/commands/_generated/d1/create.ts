import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/d1.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 d1 create\n\nCreate a new D1 database in your account.")
		.option("jurisdiction", {
			type: "string",
			description:
				"Specify the location to restrict the D1 database to run and store data. If this option is present, the location hint is ignored.",
			choices: ["eu", "fedramp", "us"],
		})
		.option("name", { type: "string", description: "D1 database name." })
		.option("primary-location-hint", {
			type: "string",
			description:
				"Specify the region to create the D1 primary, if available. If this option is omitted, the D1 will be created as close as possible to the current user.",
			choices: ["wnam", "enam", "weur", "eeur", "apac", "oc"],
		})
		.option("read-replication-mode", {
			type: "string",
			description:
				"The read replication mode for the database. Use 'auto' to create replicas and allow D1 automatically place them around the world, or 'disabled' to not use any database replicas (it can take a few hours for all replicas to be deleted).",
			choices: ["auto", "disabled"],
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
			const groupSet = ["read-replication-mode"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["read-replication-mode"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --read_replication-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"d1-create-database">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create D1 Database",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 create",
				classification: {
					safeFlags: [
						"jurisdiction",
						"primary-location-hint",
						"read-replication-mode",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										jurisdiction: resolveFileToken(
											argv["jurisdiction"] as string | undefined,
											"jurisdiction",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										primary_location_hint: resolveFileToken(
											argv["primary-location-hint"] as string | undefined,
											"primary-location-hint",
											"text"
										),
										read_replication: {
											mode: resolveFileToken(
												argv["read-replication-mode"] as string | undefined,
												"read-replication-mode",
												"text"
											),
										},
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
						client.d1.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"D1 database name."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					jurisdiction: resolveFileToken(
						argv["jurisdiction"] as string | undefined,
						"jurisdiction",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					primary_location_hint: resolveFileToken(
						argv["primary-location-hint"] as string | undefined,
						"primary-location-hint",
						"text"
					),
					read_replication: {
						mode: resolveFileToken(
							argv["read-replication-mode"] as string | undefined,
							"read-replication-mode",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.d1.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
