import $access from "./access/index.js";
import $casb from "./casb/index.js";
import $connectivitysettings from "./connectivity-settings/index.js";
import $cws from "./cws/index.js";
import $devices from "./devices/index.js";
import $dex from "./dex/index.js";
import $dlp from "./dlp/index.js";
import $gateway from "./gateway/index.js";
import $identityproviders from "./identity-providers/index.js";
import $organization from "./organization/index.js";
import $region from "./region/index.js";
import $regions from "./regions/index.js";
import $riskscoring from "./risk-scoring/index.js";
import $users from "./users/index.js";
/**
 * zero-trust command
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "zero-trust",
	describe:
		"Cloudflare's SASE platform — secure access, device posture, DLP, tunnels, gateway policies, and network segmentation",

	routes: {
		access: $access,
		casb: $casb,
		"connectivity-settings": $connectivitysettings,
		cws: $cws,
		devices: $devices,
		dex: $dex,
		dlp: $dlp,
		gateway: $gateway,
		"identity-providers": $identityproviders,
		organization: $organization,
		region: $region,
		regions: $regions,
		"risk-scoring": $riskscoring,
		users: $users,
	},
});

export default command;
