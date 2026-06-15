import { prisma } from "../../../db/prisma.js";
import { vi } from "vitest";

function prismaPostalCodesSpyOnMock() {
  vi.spyOn(prisma.postalCode, "findUnique").mockImplementation(
    async ({ where }) => {
      const postalCodes = [
        { code: 71000, city: "Sarajevo", post: "BH_POSTA" },
        { code: 71001, city: "Sarajevo", post: "POSTE_SRP" },
        { code: 78000, city: "Banja Luka", post: "HP_MOSTAR" },
      ];

      return (
        postalCodes.find((postalCode) => postalCode.code === where.code) || null
      );
    },
  );
  vi.spyOn(prisma.postalCode, "findMany").mockImplementation(
    async ({ where }) => {
      const postalCodes = [
        { code: 71000, city: "Sarajevo", post: "BH_POSTA" },
        { code: 71001, city: "Sarajevo", post: "POSTE_SRP" },
        { code: 78000, city: "Banja Luka", post: "HP_MOSTAR" },
      ];

      if (!where) {
        return postalCodes;
      }

      return postalCodes.filter(
        (postalCode) =>
          postalCode.city.toLowerCase() === where.city.toLowerCase(),
      );
    },
  );
  vi.spyOn(prisma.postalCode, "create").mockImplementation(async ({ data }) => {
    return {
      code: data.code,
      city: data.city,
      post: data.post || null,
    };
  });
  vi.spyOn(prisma.postalCode, "createMany").mockImplementation(
    async ({ data }) => {
      return {
        count: data.length,
      };
    },
  );
  vi.spyOn(prisma.postalCode, "update").mockImplementation(
    async ({ where, data }) => {
      return {
        code: where.code,
        city: data.city,
        post: data.post || null,
      };
    },
  );
  vi.spyOn(prisma.postalCode, "deleteMany").mockImplementation(
    async ({ where }) => {
      return {
        code: where.code,
        city: "Deleted City",
        post: "Deleted Post",
      };
    },
  );
}

export { prismaPostalCodesSpyOnMock };
