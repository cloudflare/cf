import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * revoke command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete, promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access users revoke\n\nRevokes a user's access across all applications."
		)
		.option("devices", {
			type: "boolean",
			description:
				"When set to `true`, all devices associated with the user will be revoked.",
		})
		.option("email", {
			type: "string",
			description: "The email of the user to revoke.",
		})
		.option("user-uid", {
			type: "string",
			description: "The uuid of the user to revoke.",
		})
		.option("warp-session-reauth", {
			type: "boolean",
			description:
				"When set to `true`, the user will be required to re-authenticate to WARP for all Gateway policies that enforce a WARP client session duration. When `false`, the user’s WARP session will remain active",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:post:/{account_or_zone}/{account_or_zone_id}/access/organizations/revoke_user">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "revoke",
	describe: "Revoke all Access tokens for a user",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access users revoke",
				classification: {
					safeFlags: ["devices", "warp-session-reauth", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf zero-trust access users revoke",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/access/organizations/revoke_user`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										devices: argv["devices"],
										email: resolveFileToken(
											argv["email"] as string | undefined,
											"email",
											"text"
										),
										user_uid: resolveFileToken(
											argv["user-uid"] as string | undefined,
											"user-uid",
											"text"
										),
										warp_session_reauth: argv["warp-session-reauth"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation revokes all access tokens for a user destructively.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.zeroTrust.access.users.revoke({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
				if (argv["email"] === undefined) {
					argv["email"] = await promptForRequiredField(
						"email",
						"The email of the user to revoke."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					devices: argv["devices"],
					email: resolveFileToken(
						argv["email"] as string | undefined,
						"email",
						"text"
					),
					user_uid: resolveFileToken(
						argv["user-uid"] as string | undefined,
						"user-uid",
						"text"
					),
					warp_session_reauth: argv["warp-session-reauth"],
				});
				const result = await withProgress(`Deleting`, async () =>
					client.zeroTrust.access.users.revoke({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
