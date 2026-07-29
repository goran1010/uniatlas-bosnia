export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  descriptionKey: string;
  params?:
    | {
        name?: string;
        required?: boolean;
        descriptionKey?: string;
      }[]
    | null;
  requestExample?: string | null;
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
        successExample: `{
        "message": "CSRF token generated successfully",
        "data": "csrf-token"
      }`,
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
        requestExample: `{
        "email": "student@example.com",
        "password": "Password1",
        "confirm-password": "Password1"
      }`,
        successExample: `{
        "message": "Registration successful! Check your email.",
        "data": { "email": "student@example.com" }
      }`,
      },
      {
        method: "GET",
        path: "/auth/confirm/:token",
        descriptionKey: "api.endpointsData.authConfirm",
        successExample: "HTML confirmation page",
      },
      {
        method: "POST",
        path: "/auth/login",
        descriptionKey: "api.endpointsData.authLogin",
        requestExample: `{
        "email": "student@example.com",
        "password": "Password1"
      }`,
        successExample: `{
        "message": "Logged in successfully",
        "data": { "email": "student@example.com", "role": "USER" }
      }`,
      },
      {
        method: "GET",
        path: "/auth/github",
        descriptionKey: "api.endpointsData.authGithubStart",
        successExample: "Redirects to GitHub authorization.",
      },
      {
        method: "GET",
        path: "/auth/github/callback",
        descriptionKey: "api.endpointsData.authGithubCallback",
        successExample: "Redirects to the frontend after authentication.",
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
        successExample: `{
        "message": "User info retrieved",
        "data": { "email": "student@example.com", "role": "USER" }
      }`,
      },
      {
        method: "POST",
        path: "/users/logout",
        descriptionKey: "api.endpointsData.usersLogout",
        successExample: `{
        "message": "User logged out successfully",
        "data": null
      }`,
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
        requestExample: `{
        "entityType": "STUDY_PROGRAM",
        "parentId": 4,
        "data": { "name": "Software Engineering", "cycle": "FIRST", "durationYears": 3, "ects": 180 }
      }`,
        successExample: `{
        "message": "Suggestion submitted. An admin will review it.",
        "data": { "id": "uuid", "entityType": "STUDY_PROGRAM", "typeOfChange": "CREATE" }
      }`,
      },
      {
        method: "PUT",
        path: "/users/contribution/universities",
        descriptionKey: "api.endpointsData.contributionUpdate",
        requestExample: `{
        "entityType": "SUBJECT",
        "targetId": 12,
        "data": { "ects": 6 }
      }`,
        successExample: `{
        "message": "Edit suggestion submitted. An admin will review it.",
        "data": { "id": "uuid", "entityType": "SUBJECT", "typeOfChange": "UPDATE" }
      }`,
      },
      {
        method: "DELETE",
        path: "/users/contribution/universities",
        descriptionKey: "api.endpointsData.contributionDelete",
        requestExample: `{
        "entityType": "SUBJECT",
        "targetId": 12
      }`,
        successExample: `{
        "message": "Deletion suggestion submitted. An admin will review it.",
        "data": { "id": "uuid", "entityType": "SUBJECT", "typeOfChange": "DELETE" }
      }`,
      },
      {
        method: "GET",
        path: "/users/contribution/pending-changes/universities",
        descriptionKey: "api.endpointsData.contributionPendingList",
        successExample: `{
        "message": "Pending changes retrieved successfully.",
        "data": [{ "id": "uuid", "entityType": "SUBJECT", "typeOfChange": "UPDATE", "targetId": 12, "data": { "ects": 6 } }]
      }`,
      },
      {
        method: "DELETE",
        path: "/users/contribution/pending-changes/universities",
        descriptionKey: "api.endpointsData.contributionPendingDelete",
        requestExample: `{ "id": "pending-change-uuid" }`,
        successExample: `{
        "message": "Pending change deleted successfully.",
        "data": null
      }`,
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
        successExample: `{
        "message": "Pending changes retrieved successfully.",
        "data": [{ "id": "uuid", "entityType": "SUBJECT", "typeOfChange": "UPDATE", "user": { "email": "student@example.com", "role": "USER" } }]
      }`,
      },
      {
        method: "POST",
        path: "/users/admin/approve-pending-change",
        descriptionKey: "api.endpointsData.adminApprove",
        requestExample: `{ "id": "pending-change-uuid" }`,
        successExample: `{
        "message": "Pending change approved successfully.",
        "data": null
      }`,
      },
      {
        method: "DELETE",
        path: "/users/admin/decline-pending-change",
        descriptionKey: "api.endpointsData.adminDecline",
        requestExample: `{ "id": "pending-change-uuid" }`,
        successExample: `{
        "message": "Pending change declined successfully.",
        "data": null
      }`,
      },
    ],
  },
];

export { apiEndpoints, authenticatedGroupsEndpoints };
