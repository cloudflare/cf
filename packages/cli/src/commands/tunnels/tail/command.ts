import { createCommandClient } from "../../../lib/auth.js";
import { CliExit } from "../../../lib/cli-exit.js";
import { getAccountId } from "../../../lib/context.js";
import { withCloudflareDotEnv } from "../../../lib/dotenv.js";
import { withProgress } from "../../../lib/progress.js";
import { runCloudflared } from "../../cloudflared.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

const EVENTS = ["cloudflared", "http", "tcp", "udp"] as const;
const LEVELS = ["debug", "info", "warn", "error"] as const;
const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUUID(value: string, label: string): string {
	if (!UUID_PATTERN.test(value)) {
		throw new Error(`${label} must be a valid UUID.`);
	}
	return value;
}

interface TunnelTailArgs extends CommonYargsOptions {
	"tunnel-id"?: string;
	"connector-id"?: string;
	event?: (typeof EVENTS)[number][];
	level?: (typeof LEVELS)[number];
	sample?: number;
}

const command: CommandModule<CommonYargsOptions, TunnelTailArgs> = {
	command: "tail [tunnel-id]",
	describe: "Stream logs from a remote cloudflared instance.",
	builder: (yargs: Argv<CommonYargsOptions>): Argv<TunnelTailArgs> =>
		yargs
			.positional("tunnel-id", {
				type: "string",
				coerce: (tunnelId: string) => validateUUID(tunnelId, "Tunnel ID"),
				description: "Tunnel UUID to stream logs from",
			})
			.option("connector-id", {
				type: "string",
				coerce: (connectorId: string) =>
					validateUUID(connectorId, "--connector-id"),
				description: "Target a specific cloudflared connector",
			})
			.option("event", {
				type: "string",
				choices: EVENTS,
				array: true,
				description: "Filter by event type (may be repeated)",
			})
			.option("level", {
				type: "string",
				choices: LEVELS,
				description: "Filter by log level",
			})
			.option("sample", {
				type: "number",
				coerce: (sample: number) => {
					if (!Number.isFinite(sample) || sample <= 0 || sample > 1) {
						throw new Error(
							"--sample must be greater than 0.0 and no greater than 1.0."
						);
					}
					return sample;
				},
				description:
					"Sample log events by fraction greater than 0.0 and no greater than 1.0",
			}) as Argv<TunnelTailArgs>,
	handler: async (argv: ArgumentsCamelCase<TunnelTailArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf tunnels tail.");
		}
		const inheritedManagementToken = process.env.TUNNEL_MANAGEMENT_TOKEN;
		if (
			inheritedManagementToken !== undefined &&
			!inheritedManagementToken.trim()
		) {
			throw new Error("TUNNEL_MANAGEMENT_TOKEN must not be empty.");
		}
		if (inheritedManagementToken && argv["tunnel-id"]) {
			throw new Error(
				"Specify either a tunnel ID or TUNNEL_MANAGEMENT_TOKEN, not both."
			);
		}

		let managementToken = inheritedManagementToken;
		if (!managementToken) {
			const tunnelId = argv["tunnel-id"];
			if (!tunnelId) {
				throw new Error(
					"Either a tunnel ID or TUNNEL_MANAGEMENT_TOKEN must be provided."
				);
			}
			managementToken = await withCloudflareDotEnv(
				{ mode: argv.mode, local: argv.local },
				async () => {
					const client = await createCommandClient(argv);
					const accountId = await getAccountId();
					return withProgress("Fetching tunnel management token", async () =>
						client.tunnels.managementToken.create({
							account_id: accountId,
							tunnel_id: tunnelId,
							resources: ["logs"],
						})
					);
				}
			);
		}

		const args = ["tail", "--output", "json"];
		if (argv["connector-id"]) {
			args.push("--connector-id", argv["connector-id"]);
		}
		if (argv.event) {
			for (const event of argv.event) {
				args.push("--event", event);
			}
		}
		if (argv.level) {
			args.push("--level", argv.level);
		}
		if (argv.sample !== undefined) {
			args.push("--sample", String(argv.sample));
		}
		if (argv["tunnel-id"]) {
			args.push(argv["tunnel-id"]);
		}
		throw new CliExit(
			await runCloudflared(args, {
				env: { TUNNEL_MANAGEMENT_TOKEN: managementToken },
			})
		);
	},
};

export default command;
