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
    path: "/api/v1/search",
    descriptionKey: "api.endpointsData.search",
    params: [
      {
        name: "searchTerm",
        required: true,
        descriptionKey: "api.endpointsData.searchTermParam",
      },
    ],
    successExample: `{
  "message": "Search results retrieved successfully.",
  "data": {
    "universities": [
      { "id": 1, "name": "University of Sarajevo", "acronym": "UNSA", "city": "Sarajevo" }
    ],
    "faculties": [
      { "id": 1, "name": "Faculty of Electrical Engineering", "city": "Sarajevo",
        "university": { "id": 1, "name": "University of Sarajevo" }
      }
    ],
    "studyPrograms": [
      { "id": 1, "name": "Software Engineering", "cycle": "PRVI",
        "faculty": { "id": 1, "name": "Faculty of Electrical Engineering",
          "university": { "id": 1, "name": "University of Sarajevo" }
        }
      }
    ],
    "subjects": [
      { "id": 1, "name": "Computer Networks", "semester": 4, "ects": 6,
        "studyProgram": { "id": 1, "name": "Software Engineering",
          "faculty": { "id": 1, "name": "Faculty of Electrical Engineering",
            "university": { "id": 1, "name": "University of Sarajevo" }
          }
        }
      }
    ]
  }
}`,
    errorExample: `// 404 - no match found
{ "error": { "message": "No results found matching your search." } }

// 400 - invalid searchTerm
{ "error": { "message": "Request validation failed." } }`,
  },
];

export { apiEndpoints };
