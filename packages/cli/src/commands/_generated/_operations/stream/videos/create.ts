/** @generated from stream.videos.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/stream",
	query: ["direct_user"],
	headers: [
		"Tus-Resumable",
		"Upload-Creator",
		"Upload-Length",
		"Upload-Metadata",
	],
	response: false,
} as const;
