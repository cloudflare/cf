import $hostnameassociations from "./hostname-associations/index.js";
import $hostnamecertificates from "./hostname-certificates/index.js";
import $hostnames from "./hostnames/index.js";
import $settings from "./settings/index.js";
import $zonecertificates from "./zone-certificates/index.js";
/**
 * origin-tls-client-auth command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "origin-tls-client-auth",
	describe: "Operations for origin-tls-client-auth",

	routes: {
		"hostname-associations": $hostnameassociations,
		"hostname-certificates": $hostnamecertificates,
		hostnames: $hostnames,
		settings: $settings,
		"zone-certificates": $zonecertificates,
	},
});

export default command;
