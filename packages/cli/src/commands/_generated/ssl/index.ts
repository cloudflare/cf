import $analyze from "./analyze/index.js";
import $autoorigintlskex from "./auto-origin-tls-kex/index.js";
import $automaticupgrader from "./automatic-upgrader/index.js";
import $certificateauthorities from "./certificate-authorities/index.js";
import $certificatepacks from "./certificate-packs/index.js";
import $clientcertificates from "./client-certificates/index.js";
import $ctalerting from "./ct-alerting/index.js";
import $customcertificates from "./custom-certificates/index.js";
import $dcvdelegation from "./dcv-delegation/index.js";
import $keylesscertificates from "./keyless-certificates/index.js";
import $mtlscertificates from "./mtls-certificates/index.js";
import $origincacertificates from "./origin-ca-certificates/index.js";
import $origintlsclientauth from "./origin-tls-client-auth/index.js";
import $recommendations from "./recommendations/index.js";
import $universal from "./universal/index.js";
import $verification from "./verification/index.js";
/**
 * ssl command
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ssl",
	describe:
		"SSL/TLS certificate management — certificate packs, Universal SSL, verification, and TLS mode recommendations",

	routes: {
		analyze: $analyze,
		"auto-origin-tls-kex": $autoorigintlskex,
		"automatic-upgrader": $automaticupgrader,
		"certificate-authorities": $certificateauthorities,
		"certificate-packs": $certificatepacks,
		"client-certificates": $clientcertificates,
		"ct-alerting": $ctalerting,
		"custom-certificates": $customcertificates,
		"dcv-delegation": $dcvdelegation,
		"keyless-certificates": $keylesscertificates,
		"mtls-certificates": $mtlscertificates,
		"origin-ca-certificates": $origincacertificates,
		"origin-tls-client-auth": $origintlsclientauth,
		recommendations: $recommendations,
		universal: $universal,
		verification: $verification,
	},
});

export default command;
