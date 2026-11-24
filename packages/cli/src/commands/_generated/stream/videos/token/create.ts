import operation from "../../../_operations/stream/videos/token/create.js";
/**
 * create command
 * @generated from apis/overlays/stream.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <identifier>",
	describe: "Create signed URL tokens for videos",
	usage:
		"$0 stream videos token create <identifier>\n\nCreates a signed URL token for a video. If a body is not provided in the request, a token is created with default values.",
	flags: {
		"access-rules": {
			kind: "parsed",
			brief:
				'The optional list of access rule constraints on the token. Access can be blocked or allowed based on an IP, IP range, or by country. Access rules are evaluated from first to last. If a rule matches, the associated action is applied and no further rules are evaluated. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"action"?: "allow" | "block", "country"?: [string], "ip"?: [string], "type"?: "any" | "ip.src" | "ip.geoip.country"}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		downloadable: {
			kind: "boolean",
			brief:
				"The optional boolean value that enables using signed tokens to access MP4 download links for a video.",
			default: false,
		},
		exp: {
			kind: "parsed",
			brief:
				"The optional unix epoch timestamp that specficies the time after a token is not accepted. The maximum time specification is 24 hours from issuing time. If this field is not set, the default is one hour after issuing.",
			optional: true,
			parse: Number,
		},
		"flags-original": {
			kind: "boolean",
			brief: "Whether to return the original video without transformations.",
			optional: true,
		},
		id: {
			kind: "parsed",
			brief:
				"The optional ID of a Stream signing key. If present, the `pem` field is also required.",
			optional: true,
			parse: String,
		},
		nbf: {
			kind: "parsed",
			brief:
				"The optional unix epoch timestamp that specifies the time before a the token is not accepted. If this field is not set, the default is one hour before issuing.",
			optional: true,
			parse: Number,
		},
		pem: {
			kind: "parsed",
			brief:
				"The optional base64 encoded private key in PEM format associated with a Stream signing key. If present, the `id` field is also required.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
		{
			placeholder: "identifier",
			brief: "A Cloudflare-generated unique identifier for a media item.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos token create",
				classification: {
					safeFlags: ["downloadable", "flags-original", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos token create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/token`,
						pathParams: { identifier: String(argv["identifier"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										accessRules: parseObjectArray(
											argv["access-rules"],
											"access-rules"
										),
										downloadable: argv["downloadable"],
										exp: argv["exp"],
										flags: {
											original: argv["flags-original"],
										},
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
										nbf: argv["nbf"],
										pem: resolveFileToken(
											argv["pem"] as string | undefined,
											"pem",
											"text"
										),
									}),
						sensitiveBodyPaths: [["pem"]],
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Provision temporary token? For use at scale, consider creating a signing key instead.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Processing`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							identifier: argv["identifier"],
						})
					);
					formatOutput(result, { successLabel: `Done` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					accessRules: parseObjectArray(argv["access-rules"], "access-rules"),
					downloadable: argv["downloadable"],
					exp: argv["exp"],
					flags: {
						original: argv["flags-original"],
					},
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					nbf: argv["nbf"],
					pem: resolveFileToken(
						argv["pem"] as string | undefined,
						"pem",
						"text"
					),
				});
				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						identifier: argv["identifier"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
			}
		),
});

export default command;
