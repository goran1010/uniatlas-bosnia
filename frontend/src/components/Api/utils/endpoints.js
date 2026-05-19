const endpoints = [
  {
    method: "GET",
    path: "/api",
    descriptionKey: "api.endpointsData.apiStatus",
    params: null,
    successExample: `{
  "data": { "status": "ok" },
  "message": "API server is running"
}`,
    errorExample: null,
  },
  {
    method: "GET",
    path: "/api/v1",
    descriptionKey: "api.endpointsData.apiV1Status",
    params: null,
    successExample: `{
  "data": { "status": "ok" },
  "message": "API v1 server is running"
}`,
    errorExample: null,
  },
  {
    method: "GET",
    path: "/api/v1/postal-codes",
    descriptionKey: "api.endpointsData.getAllPostalCodes",
    params: null,
    successExample: `{
  "message": "Postal codes retrieved successfully",
  "data": [
    { "id": "...", "code": 71000, "city": "Sarajevo", "post": "BH_POSTA" },
    ...
  ]
}`,
    errorExample: null,
  },
  {
    method: "GET",
    path: "/api/v1/postal-codes/search",
    descriptionKey: "api.endpointsData.searchPostalCodes",
    params: [
      {
        name: "searchTerm",
        required: true,
        descriptionKey: "api.endpointsData.searchTermParam",
      },
    ],
    successExample: `{
  "message": "Postal codes retrieved successfully",
  "data": [
    { "id": "...", "code": 71000, "city": "Sarajevo", "post": "BH_POSTA" }
  ]
}`,
    errorExample: `// 404 - no match found
{ "error": { "message": "Postal code not found: verify the search term and try again." } }

// 400 - invalid searchTerm
{ "error": { "message": "Validation failed: Postal codes must have 5 numbers. Fix the highlighted fields and try again." } }`,
  },
];

const authenticatedGroups = [
  {
    titleKey: "api.groups.csrf",
    endpoints: [
      {
        method: "GET",
        path: "/csrf-token",
        descriptionKey: "api.endpointsData.csrfIssue",
      },
    ],
  },
  {
    titleKey: "api.groups.auth",
    endpoints: [
      {
        method: "POST",
        path: "/auth/signup",
        descriptionKey: "api.endpointsData.authSignup",
      },
      {
        method: "GET",
        path: "/auth/confirm/:token",
        descriptionKey: "api.endpointsData.authConfirm",
      },
      {
        method: "POST",
        path: "/auth/login",
        descriptionKey: "api.endpointsData.authLogin",
      },
      {
        method: "GET",
        path: "/auth/github",
        descriptionKey: "api.endpointsData.authGithubStart",
      },
      {
        method: "GET",
        path: "/auth/github/callback",
        descriptionKey: "api.endpointsData.authGithubCallback",
      },
    ],
  },
  {
    titleKey: "api.groups.users",
    endpoints: [
      {
        method: "GET",
        path: "/users/me",
        descriptionKey: "api.endpointsData.usersMe",
      },
      {
        method: "POST",
        path: "/users/logout",
        descriptionKey: "api.endpointsData.usersLogout",
      },
    ],
  },
  {
    titleKey: "api.groups.contributions",
    endpoints: [
      {
        method: "POST",
        path: "/users/contribution/postal-codes",
        descriptionKey: "api.endpointsData.contributionCreate",
      },
      {
        method: "PUT",
        path: "/users/contribution/postal-codes",
        descriptionKey: "api.endpointsData.contributionUpdate",
      },
      {
        method: "DELETE",
        path: "/users/contribution/postal-codes",
        descriptionKey: "api.endpointsData.contributionDelete",
      },
      {
        method: "GET",
        path: "/users/contribution/pending-changes/postal-codes",
        descriptionKey: "api.endpointsData.contributionPendingList",
      },
      {
        method: "DELETE",
        path: "/users/contribution/pending-changes/postal-codes",
        descriptionKey: "api.endpointsData.contributionPendingDelete",
      },
    ],
  },
  {
    titleKey: "api.groups.admin",
    endpoints: [
      {
        method: "GET",
        path: "/users/admin/pending-changes",
        descriptionKey: "api.endpointsData.adminPendingList",
      },
      {
        method: "POST",
        path: "/users/admin/approve-pending-change",
        descriptionKey: "api.endpointsData.adminApprove",
      },
      {
        method: "DELETE",
        path: "/users/admin/decline-pending-change",
        descriptionKey: "api.endpointsData.adminDecline",
      },
    ],
  },
];

export { endpoints, authenticatedGroups };
