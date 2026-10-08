/** @generated from zero-trust.cws.basic-auth-credentials.secrets.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cws/basic-auth-credentials/{credential_id}/secrets",
	body: "json",
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
