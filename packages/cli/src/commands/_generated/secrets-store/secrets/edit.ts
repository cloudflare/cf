import operation from "../../_operations/secrets-store/secrets/edit.js";
/**
 * edit command
 * @generated from apis/overlays/secrets-store.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "edit <secret-id>",
	describe: "Patch a secret",
	usage:
		"$0 secrets-store secrets edit <secret-id>\n\nUpdates a single secret.",
	flags: {
		"store-id": { kind: "parsed", brief: "Store identifier.", parse: String },
		comment: {
			kind: "parsed",
			brief: "Freeform text describing the secret.",
			optional: true,
			parse: String,
		},
		scopes: {
			kind: "parsed",
			brief:
				"The list of services that can use this secret, or null when the secret inherits its store's scopes. Set it to null in a patch to inherit again. An empty list lets no service use the secret.",
			variadic: true,
			optional: true,
			parse: String,
		},
		value: {
			kind: "parsed",
			brief:
				"The value of the secret. Maximum 64 KiB (65,536 bytes). Note that this is 'write only' - the API never returns this value; it exists only to create or modify secrets.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "secret-id", brief: "Secret identifier.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "secrets-store secrets edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf secrets-store secrets edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/secrets_store/stores/${argv["store-id"] == null ? "<store-id>" : encodeURIComponent(String(argv["store-id"]))}/secrets/${argv["secret-id"] == null ? "<secret-id>" : encodeURIComponent(String(argv["secret-id"]))}`,
						pathParams: {
							"store-id": String(argv["store-id"] ?? ""),
							"secret-id": String(argv["secret-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comment: resolveFileToken(
											argv["comment"] as string | undefined,
											"comment",
											"text"
										),
										scopes: argv["scopes"],
										value: resolveFileToken(
											argv["value"] as string | undefined,
											"value",
											"text"
										),
									}),
						sensitiveBodyPaths: [["value"]],
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							store_id: argv["store-id"],
							secret_id: argv["secret-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					comment: resolveFileToken(
						argv["comment"] as string | undefined,
						"comment",
						"text"
					),
					scopes: argv["scopes"],
					value: resolveFileToken(
						argv["value"] as string | undefined,
						"value",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						store_id: argv["store-id"],
						secret_id: argv["secret-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
