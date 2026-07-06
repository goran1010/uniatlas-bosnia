import request from "supertest";
import { describe, test, expect } from "vitest";
import { app } from "../../src/app.js";
import { createAndLoginUser } from "../utils/createUserAndLogin.js";
import { createNewUserInput } from "../utils/createNewUserInput.js";
import { prisma } from "../../src/db/prisma.js";
import type { entityType } from "../../src/generated/prisma/enums.js";

describe("Admin Router - GET /users/admin/pending-changes", () => {
  test("Responds with status 200 and all pending changes if role ADMIN", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        targetId: 1,
        parentId: null,
        data: {
          name: "Test Admin GET University",
          city: "Test City",
          entity: "FBIH",
          ownership: "JAVNA",
        },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent.get("/users/admin/pending-changes");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Pending changes retrieved successfully.",
      }),
    );

    await prisma.pendingChange.delete({ where: { id: pendingChange.id } });
    await prisma.user.delete({ where: { id: userInDb.id } });
  });
});

describe("Admin Router - DELETE /users/admin/decline-pending-change", () => {
  test("Responds with status 200 if role ADMIN", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        targetId: 1,
        parentId: null,
        data: {
          name: "Test Decline University",
          city: "Test City",
          entity: "FBIH",
          ownership: "JAVNA",
        },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .delete("/users/admin/decline-pending-change")
      .send({
        id: pendingChange.id,
      });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Pending change declined successfully.",
      }),
    );

    await prisma.user.delete({ where: { id: userInDb.id } });
  });
});

describe("Admin Router - POST /users/admin/approve-pending-change", () => {
  test("Responds with status 404 if pending change does not exist", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: "a7d3c8f1-4b9e-4f2a-8c3e-5d7f1b9a2c6e",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: { message: "Pending change not found." },
      }),
    );

    await prisma.user.delete({ where: { id: userInDb.id } });
  });

  test("Responds with status 404 if stored pending change data is invalid for its entity type", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        targetId: null,
        parentId: null,
        data: {
          name: "Malformed University",
        },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });

    expect(response.status).toBe(404);

    await prisma.pendingChange.delete({ where: { id: pendingChange.id } });
    await prisma.user.delete({ where: { id: userInDb.id } });
  });

  const entityTypes: entityType[] = [
    "UNIVERSITY",
    "FACULTY",
    "STUDY_PROGRAM",
    "SUBJECT",
  ];

  test.each(entityTypes)(
    "Responds with status 404 if stored pending change target id is null for a DELETE change type for entity type %s",
    async (entityType) => {
      const userInput = createNewUserInput({ role: "ADMIN" });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ["confirm-password"]: confirmPassword, ...userRequested } =
        userInput;

      const userInDb = await prisma.user.create({
        data: userRequested,
      });

      const pendingChange = await prisma.pendingChange.create({
        data: {
          entityType,
          typeOfChange: "DELETE",
          targetId: null,
          parentId: null,
          data: {},
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          reviewedAt: null,
          user: { connect: { id: userInDb.id } },
        },
      });

      const agent = request.agent(app);
      await createAndLoginUser(agent, { role: "ADMIN" });

      const response = await agent
        .post("/users/admin/approve-pending-change")
        .send({
          id: pendingChange.id,
        });

      expect(response.status).toBe(404);

      await prisma.pendingChange.delete({ where: { id: pendingChange.id } });
      await prisma.user.delete({ where: { id: userInDb.id } });
    },
  );

  test.each(entityTypes)(
    "Responds with status 404 if stored pending change target id is null for UPDATE change type for entity type %s",
    async (entityType) => {
      const userInput = createNewUserInput({ role: "ADMIN" });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ["confirm-password"]: confirmPassword, ...userRequested } =
        userInput;

      const userInDb = await prisma.user.create({
        data: userRequested,
      });

      const pendingChange = await prisma.pendingChange.create({
        data: {
          entityType,
          typeOfChange: "UPDATE",
          targetId: null,
          parentId: null,
          data: {},
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          reviewedAt: null,
          user: { connect: { id: userInDb.id } },
        },
      });

      const agent = request.agent(app);
      await createAndLoginUser(agent, { role: "ADMIN" });

      const response = await agent
        .post("/users/admin/approve-pending-change")
        .send({
          id: pendingChange.id,
        });

      expect(response.status).toBe(404);

      await prisma.pendingChange.delete({ where: { id: pendingChange.id } });
      await prisma.user.delete({ where: { id: userInDb.id } });
    },
  );

  test.each(["FACULTY", "STUDY_PROGRAM", "SUBJECT"])(
    "Responds with status 404 if stored pending change parent id is null for CREATE change type for entity type %s",
    async (entityType) => {
      const userInput = createNewUserInput({ role: "ADMIN" });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ["confirm-password"]: confirmPassword, ...userRequested } =
        userInput;

      const userInDb = await prisma.user.create({
        data: userRequested,
      });

      const pendingChange = await prisma.pendingChange.create({
        data: {
          // @ts-expect-error - Testing only 3 of 4 entity types, so this is fine
          entityType,
          typeOfChange: "CREATE",
          targetId: null,
          parentId: null,
          data: {},
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          reviewedAt: null,
          user: { connect: { id: userInDb.id } },
        },
      });

      const agent = request.agent(app);
      await createAndLoginUser(agent, { role: "ADMIN" });

      const response = await agent
        .post("/users/admin/approve-pending-change")
        .send({
          id: pendingChange.id,
        });

      expect(response.status).toBe(404);

      await prisma.pendingChange.delete({ where: { id: pendingChange.id } });
      await prisma.user.delete({ where: { id: userInDb.id } });
    },
  );
});

describe("Admin Router - POST /users/admin/approve-pending-change for UNIVERSITY", () => {
  test("Responds with status 200 and message if a pending change is approved successfully DELETE", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const university = await prisma.university.create({
      data: {
        name: "Test DELETE University",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "UNIVERSITY",
        typeOfChange: "DELETE",
        targetId: university.id,
        parentId: null,

        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await prisma.user.delete({ where: { id: userInDb.id } });
  });

  test("Responds with status 200 and message if a pending change is approved successfully for CREATE", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        targetId: null,
        parentId: null,
        data: {
          name: "Test Create University",
          city: "Test City",
          entity: "FBIH",
          ownership: "JAVNA",
        },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
    await prisma.university.deleteMany();

    await prisma.user.delete({ where: { id: userInDb.id } });
  });

  test("Responds with status 200 and message if a pending change is approved successfully for UPDATE", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const university = await prisma.university.create({
      data: {
        name: "Test Update University",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "UNIVERSITY",
        typeOfChange: "UPDATE",
        targetId: university.id,
        parentId: null,
        data: {
          name: "Test Approve University Updated",
          city: "Test City Updated",
          entity: "RS",
          ownership: "PRIVATNA",
        },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
    await prisma.university.deleteMany();

    await prisma.user.delete({ where: { id: userInDb.id } });
  });
});

describe("Admin Router - POST /users/admin/approve-pending-change for FACULTY", () => {
  test("Responds with status 200 and message if a pending change is approved successfully for CREATE", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const university = await prisma.university.create({
      data: {
        name: "Test University for CREATE",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "FACULTY",
        typeOfChange: "CREATE",
        targetId: null,
        parentId: university.id,
        data: {
          name: "Test Create Faculty",
          city: "Test City",
          entity: "FBIH",
          ownership: "JAVNA",
        },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await prisma.faculty.deleteMany();
    await prisma.university.deleteMany();

    await prisma.user.delete({ where: { id: userInDb.id } });
  });

  test("Responds with status 200 and message if a pending change is approved successfully for UPDATE", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const university = await prisma.university.create({
      data: {
        name: "Test University for UPDATE",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        name: "Test Update Faculty",
        city: "Test City",
        universityId: university.id,
      },
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "FACULTY",
        typeOfChange: "UPDATE",
        targetId: faculty.id,
        parentId: university.id,
        data: {
          name: "Test Approve Faculty Updated",
          city: "Test City Updated",
        },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await prisma.faculty.deleteMany();
    await prisma.university.deleteMany();

    await prisma.user.delete({ where: { id: userInDb.id } });
  });

  test("Responds with status 200 and message if a pending change is approved successfully for DELETE", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const university = await prisma.university.create({
      data: {
        name: "Test University for DELETE",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        name: "Test Delete Faculty",
        city: "Test City",
        universityId: university.id,
      },
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "FACULTY",
        typeOfChange: "DELETE",
        targetId: faculty.id,
        parentId: university.id,
        data: {},
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await prisma.faculty.deleteMany();
    await prisma.university.deleteMany();
    await prisma.user.delete({ where: { id: userInDb.id } });
  });
});

describe("Admin Router - POST /users/admin/approve-pending-change for STUDY_PROGRAM", () => {
  test("Responds with status 200 and message if a pending change is approved successfully DELETE", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const university = await prisma.university.create({
      data: {
        name: "Test University for DELETE",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        name: "Test Delete Faculty",
        city: "Test City",
        universityId: university.id,
      },
    });

    const studyProgram = await prisma.studyProgram.create({
      data: {
        name: "Test Delete Study Program",
        cycle: "FIRST",
        facultyId: faculty.id,
      },
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "STUDY_PROGRAM",
        typeOfChange: "DELETE",
        targetId: studyProgram.id,
        parentId: faculty.id,
        data: {},
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await prisma.studyProgram.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.user.delete({ where: { id: userInDb.id } });
  });

  test("Responds with status 200 and message if a pending change is approved successfully for CREATE", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const university = await prisma.university.create({
      data: {
        name: "Test University for CREATE",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        name: "Test Create Faculty",
        city: "Test City",
        universityId: university.id,
      },
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "STUDY_PROGRAM",
        typeOfChange: "CREATE",
        targetId: null,
        parentId: faculty.id,
        data: {
          name: "Test Create Study Program",
          cycle: "FIRST",
        },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await prisma.studyProgram.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.user.delete({ where: { id: userInDb.id } });
  });

  test("Responds with status 200 and message if a pending change is approved successfully for UPDATE", async () => {
    const userInput = createNewUserInput({ role: "ADMIN" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      userInput;

    const userInDb = await prisma.user.create({
      data: userRequested,
    });

    const university = await prisma.university.create({
      data: {
        name: "Test University for UPDATE",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        name: "Test Update Faculty",
        city: "Test City",
        universityId: university.id,
      },
    });

    const studyProgram = await prisma.studyProgram.create({
      data: {
        name: "Test Update Study Program",
        cycle: "FIRST",
        facultyId: faculty.id,
      },
    });

    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "STUDY_PROGRAM",
        typeOfChange: "UPDATE",
        targetId: studyProgram.id,
        parentId: faculty.id,
        data: {
          name: "Test Approve Study Program Updated",
          cycle: "SECOND",
        },
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: { connect: { id: userInDb.id } },
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await prisma.studyProgram.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.user.delete({ where: { id: userInDb.id } });
  });
});
