import $access from "./access/index.js";
import $apps from "./apps/index.js";
import $casb from "./casb/index.js";
import $connectivitysettings from "./connectivity-settings/index.js";
import $devices from "./devices/index.js";
import $dex from "./dex/index.js";
import $dlp from "./dlp/index.js";
import $gateway from "./gateway/index.js";
import $identityproviders from "./identity-providers/index.js";
import $organization from "./organization/index.js";
import $riskscoring from "./risk-scoring/index.js";
import $seats from "./seats/index.js";
import $users from "./users/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zero-trust command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zero-trust",
	describe:
		"Cloudflare's SASE platform — secure access, device posture, DLP, tunnels, gateway policies, and network segmentation",

	builder: (yargs) => {
		return yargs
			.command($access)
			.command($apps)
			.command($casb)
			.command($connectivitysettings)
			.command($devices)
			.command($dex)
			.command($dlp)
			.command($gateway)
			.command($identityproviders)
			.command($organization)
			.command($riskscoring)
			.command($seats)
			.command($users)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
