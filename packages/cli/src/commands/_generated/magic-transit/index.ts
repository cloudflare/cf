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
/**
 * magic-transit command
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "magic-transit",
	describe:
		"DDoS-protected network transit — GRE/IPsec tunnels, static routes, Magic WAN sites, connectors, and packet captures",

	routes: {
		"advanced-dns-protection": $advanceddnsprotection,
		"advanced-tcp-protection": $advancedtcpprotection,
		apps: $apps,
		"bgp-filter-profiles": $bgpfilterprofiles,
		"bgp-settings": $bgpsettings,
		"cf-interconnects": $cfinterconnects,
		"cf1-sites": $cf1sites,
		"gre-tunnels": $gretunnels,
		"ipsec-tunnels": $ipsectunnels,
		pcaps: $pcaps,
		"redundancy-groups": $redundancygroups,
		routes: $routes,
		sites: $sites,
	},
});

export default command;
