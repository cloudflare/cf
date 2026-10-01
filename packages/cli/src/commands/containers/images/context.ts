import { getAuthToken } from "#lib/auth-token.js";
import { getAccountId, getComplianceRegion } from "#lib/context.js";
import { getDefaultHeaders } from "#lib/request-headers.js";
import {
	configureOpenAPIForContainerPull,
	OpenAPI,
} from "@cloudflare/containers-shared";
import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils";

export async function configureRegistryAccess() {
	const token = await getAuthToken();
	const accountId = await getAccountId();
	const complianceConfig = { compliance_region: await getComplianceRegion() };
	OpenAPI.HEADERS = getDefaultHeaders();
	configureOpenAPIForContainerPull(
		accountId,
		token,
		getCloudflareApiBaseUrl(complianceConfig)
	);
	return { accountId, complianceConfig };
}
