import { vi } from "vitest";

const postalCodes = [
  { code: 71000, city: "Sarajevo", post: "BH_POSTA" },
  { code: 71001, city: "Sarajevo", post: "POSTE_SRP" },
  { code: 78000, city: "Banja Luka", post: "HP_MOSTAR" },
];

const findUniqueMock = vi.fn().mockImplementation(async ({ where }) => {
  return (
    postalCodes.find((postalCode) => postalCode.code === where.code) || null
  );
});

const findManyMock = vi.fn().mockImplementation(async (args) => {
  if (!args?.where) {
    return postalCodes;
  }

  return postalCodes.filter(
    (postalCode) =>
      postalCode.city.toLowerCase() === args.where.city.toLowerCase(),
  );
});

const createMock = vi.fn().mockImplementation(async ({ data }) => {
  return {
    code: data.code,
    city: data.city,
    post: data.post || null,
  };
});

const createManyMock = vi.fn().mockImplementation(async ({ data }) => {
  return {
    count: data.length,
  };
});

const updateMock = vi.fn().mockImplementation(async ({ where, data }) => {
  return {
    code: where.code,
    city: data.city,
    post: data.post || null,
  };
});

const deleteManyMock = vi.fn().mockImplementation(async (where) => {
  if (!where) {
    return { count: postalCodes.length };
  }

  return { count: 1 };
});

function prismaPostalCodesSpyOnMock() {
  vi.mock("../../../src/db/prisma.js", () => {
    const originalModule = vi.importActual("../../../src/db/prisma.js");
    return {
      ...originalModule,
      prisma: {
        postalCode: {
          findUnique: findUniqueMock,
          findMany: findManyMock,
          create: createMock,
          createMany: createManyMock,
          update: updateMock,
          deleteMany: deleteManyMock,
        },
      },
    };
  });
}

export { prismaPostalCodesSpyOnMock };
