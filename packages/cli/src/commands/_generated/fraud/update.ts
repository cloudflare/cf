import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/fraud.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 fraud update\n\nUpdate Fraud Detection settings for a zone. Notes on `username_expressions` behavior: - If omitted or set to null, expressions are not modified. - If provided as an empty array `[]`, all expressions will be cleared."
		)
		.option("authentication-settings-failure-criteria-kind", {
			type: "string",
			description:
				"The type of criterion. Currently only `status_code` is supported.",
			choices: ["status_code"],
		})
		.coerce(
			"authentication-settings-failure-criteria-kind",
			(value: string | undefined) =>
				resolveFileToken(
					value,
					"authentication-settings-failure-criteria-kind",
					"text"
				)
		)
		.option("authentication-settings-failure-criteria-status-codes", {
			type: "string",
			array: true,
			description:
				"HTTP status codes to match against the origin response.\n- Maximum of 10 codes per criterion.\n- Each code must be a valid HTTP status code (100-599).\n- Codes are deduplicated and sorted on save.\n- Omit to leave unchanged on update.\n- Provide an empty array `[]` to clear codes on update.\n",
		})
		.option("authentication-settings-success-criteria-kind", {
			type: "string",
			description:
				"The type of criterion. Currently only `status_code` is supported.",
			choices: ["status_code"],
		})
		.coerce(
			"authentication-settings-success-criteria-kind",
			(value: string | undefined) =>
				resolveFileToken(
					value,
					"authentication-settings-success-criteria-kind",
					"text"
				)
		)
		.option("authentication-settings-success-criteria-status-codes", {
			type: "string",
			array: true,
			description:
				"HTTP status codes to match against the origin response.\n- Maximum of 10 codes per criterion.\n- Each code must be a valid HTTP status code (100-599).\n- Codes are deduplicated and sorted on save.\n- Omit to leave unchanged on update.\n- Provide an empty array `[]` to clear codes on update.\n",
		})
		.option("user-profiles", {
			type: "string",
			description: "Whether Fraud User Profiles is enabled for the zone.",
			choices: ["enabled", "disabled"],
		})
		.coerce("user-profiles", (value: string | undefined) =>
			resolveFileToken(value, "user-profiles", "text")
		)
		.option("username-expressions", {
			type: "string",
			array: true,
			description:
				"List of expressions to detect usernames in write HTTP requests.\n\n- Maximum of 10 expressions.\n- Omit or set to null to leave unchanged on update.\n- Provide an empty array `[]` to clear all expressions on update.\n- Invalid expressions will result in a 10400 Bad Request with details in the `messages` array.\n",
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
			const groupSet = [
				"authentication-settings-failure-criteria-kind",
				"authentication-settings-failure-criteria-status-codes",
				"authentication-settings-success-criteria-kind",
				"authentication-settings-success-criteria-status-codes",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"authentication-settings-failure-criteria-kind",
					"authentication-settings-success-criteria-kind",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --authentication_settings-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"fraud-detection-zone-update-settings">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Fraud Detection Settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "fraud update",
				classification: {
					safeFlags: [
						"authentication-settings-failure-criteria-kind",
						"authentication-settings-success-criteria-kind",
						"user-profiles",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf fraud update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/fraud_detection/settings`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										authentication_settings: {
											failure_criteria: {
												kind: argv[
													"authentication-settings-failure-criteria-kind"
												],
												status_codes:
													argv[
														"authentication-settings-failure-criteria-status-codes"
													],
											},
											success_criteria: {
												kind: argv[
													"authentication-settings-success-criteria-kind"
												],
												status_codes:
													argv[
														"authentication-settings-success-criteria-status-codes"
													],
											},
										},
										user_profiles: argv["user-profiles"],
										username_expressions: argv["username-expressions"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.fraud.update({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					authentication_settings: {
						failure_criteria: {
							kind: argv["authentication-settings-failure-criteria-kind"],
							status_codes:
								argv["authentication-settings-failure-criteria-status-codes"],
						},
						success_criteria: {
							kind: argv["authentication-settings-success-criteria-kind"],
							status_codes:
								argv["authentication-settings-success-criteria-status-codes"],
						},
					},
					user_profiles: argv["user-profiles"],
					username_expressions: argv["username-expressions"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.fraud.update({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
