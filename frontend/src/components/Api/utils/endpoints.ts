export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  descriptionKey: string;
  params?: {
    name?: string;
    required?: boolean;
    descriptionKey?: string;
  }[] | null;
  successExample?: string | null;
  errorExample?: string | null;
}

const apiEndpoints: Endpoint[] = [
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
    path: "/api/v1/universities",
    descriptionKey: "api.endpointsData.getAllUniversities",
    params: null,
    successExample: `{
  "message": "Universities retrieved successfully",
  "data": [
    { "id": 1, "name": "University of Sarajevo", "acronym": "UNSA", "city": "Sarajevo", "entity": "FBIH", "ownership": "JAVNA" },
    ...
  ]
}`,
    errorExample: null,
  },
  {
    method: "GET",
    path: "/api/v1/universities/search",
    descriptionKey: "api.endpointsData.searchUniversities",
    params: [
      {
        name: "searchTerm",
        required: true,
        descriptionKey: "api.endpointsData.searchTermParam",
      },
    ],
    successExample: `{
  "message": "Universities retrieved successfully",
  "data": [
    { "id": 1, "name": "University of Sarajevo", "acronym": "UNSA", "city": "Sarajevo" }
  ]
}`,
    errorExample: `// 404 - no match found
{ "error": { "message": "No universities found for the given search term." } }

// 400 - invalid searchTerm
{ "error": { "message": "Validation failed: Search term must have at least 2 characters." } }`,
  },
  {
    method: "GET",
    path: "/api/v1/universities/:id",
    descriptionKey: "api.endpointsData.getUniversityById",
    params: null,
    successExample: `{
  "message": "University retrieved successfully",
  "data": {
    "id": 1, "name": "University of Sarajevo", "acronym": "UNSA",
    "city": "Sarajevo", "entity": "FBIH", "ownership": "JAVNA",
    "faculties": [
      { "id": 1, "name": "Faculty of Science", "studyPrograms": [ ... ] }
    ]
  }
}`,
    errorExample: `// 404
{ "error": { "message": "University not found." } }`,
  },
  {
    method: "GET",
    path: "/api/v1/study-programs/search",
    descriptionKey: "api.endpointsData.searchStudyPrograms",
    params: [
      {
        name: "searchTerm",
        required: true,
        descriptionKey: "api.endpointsData.searchTermParam",
      },
    ],
    successExample: `{
  "message": "Study programs retrieved successfully",
  "data": [
    {
      "id": 1, "name": "Software Engineering", "cycle": "FIRST",
      "faculty": { "id": 1, "name": "Faculty of Electrical Engineering",
        "university": { "id": 1, "name": "University of Sarajevo" }
      }
    }
  ]
}`,
    errorExample: `// 404 - no match found
{ "error": { "message": "No study programs found for the given search term." } }`,
  },
];

const authenticatedGroupsEndpoints: {
  titleKey: string;
  endpoints: Endpoint[];
}[] = [
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
        path: "/users/contribution/universities",
        descriptionKey: "api.endpointsData.contributionCreate",
      },
      {
        method: "PUT",
        path: "/users/contribution/universities",
        descriptionKey: "api.endpointsData.contributionUpdate",
      },
      {
        method: "DELETE",
        path: "/users/contribution/universities",
        descriptionKey: "api.endpointsData.contributionDelete",
      },
      {
        method: "GET",
        path: "/users/contribution/pending-changes/universities",
        descriptionKey: "api.endpointsData.contributionPendingList",
      },
      {
        method: "DELETE",
        path: "/users/contribution/pending-changes/universities",
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

export { apiEndpoints, authenticatedGroupsEndpoints };
