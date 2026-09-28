import $advanceddnsprotection from "./advanced-dns-protection/index.js";
import $advancedtcpprotection from "./advanced-tcp-protection/index.js";
import $apps from "./apps/index.js";
import $bgpfilterprofiles from "./bgp-filter-profiles/index.js";
import $bgpsettings from "./bgp-settings/index.js";
import $cfinterconnects from "./cf-interconnects/index.js";
import $cf1sites from "./cf1-sites/index.js";
import $gretunnels from "./gre-tunnels/index.js";
import $ipsectunnels from "./ipsec-tunnels/index.js";
import $pcaps from "./pcaps/index.js";
import $redundancygroups from "./redundancy-groups/index.js";
import $routes from "./routes/index.js";
import $sites from "./sites/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * magic-transit command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "magic-transit",
	describe:
		"DDoS-protected network transit — GRE/IPsec tunnels, static routes, Magic WAN sites, connectors, and packet captures",

	builder: (yargs) => {
		return yargs
			.command($advanceddnsprotection)
			.command($advancedtcpprotection)
			.command($apps)
			.command($bgpfilterprofiles)
			.command($bgpsettings)
			.command($cfinterconnects)
			.command($cf1sites)
			.command($gretunnels)
			.command($ipsectunnels)
			.command($pcaps)
			.command($redundancygroups)
			.command($routes)
			.command($sites)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
