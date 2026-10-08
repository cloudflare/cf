/** @generated from o11y.agents.sessions.runs */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workers/observability/agents/sessions/{conversationId}/runs",
	query: ["service", "agent", "from", "to", "cursor", "per_page"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		504: "GatewayTimeoutError",
	},
} as const;
