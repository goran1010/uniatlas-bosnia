import { prisma } from "../db/prisma.js";
import type { Prisma, University } from "../generated/prisma/client.js";

const fullUniversityInclude = {
  faculties: {
    include: {
      studyPrograms: {
        include: {
          subjects: true,
        },
      },
    },
  },
};

type searchUniversitiesParam =
  | University["name"]
  | University["city"]
  | University["acronym"];

class UniversitiesModel {
  getAll() {
    return prisma.university.findMany({ orderBy: { name: "asc" } });
  }

  getById(id: number) {
    return prisma.university.findUnique({
      where: { id },
      include: fullUniversityInclude,
    });
  }

  searchUniversities(term: NonNullable<searchUniversitiesParam>) {
    return prisma.university.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { city: { contains: term, mode: "insensitive" } },
          { acronym: { contains: term, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
    });
  }

  searchStudyPrograms(term: string) {
    return prisma.studyProgram.findMany({
      where: {
        name: { contains: term, mode: "insensitive" },
      },
      include: {
        faculty: {
          include: {
            university: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  getFacultyById(id: number) {
    return prisma.faculty.findUnique({ where: { id } });
  }

  getStudyProgramById(id: number) {
    return prisma.studyProgram.findUnique({ where: { id } });
  }

  getSubjectById(id: number) {
    return prisma.subject.findUnique({ where: { id } });
  }

  createUniversity(data: Prisma.UniversityCreateInput) {
    return prisma.university.create({ data });
  }

  updateUniversity(id: number, data: Prisma.UniversityUpdateInput) {
    return prisma.university.update({ where: { id }, data });
  }

  deleteUniversity(id: number) {
    return prisma.university.delete({ where: { id } });
  }

  createFaculty(data: Prisma.FacultyCreateInput) {
    return prisma.faculty.create({ data });
  }

  updateFaculty(id: number, data: Prisma.FacultyUpdateInput) {
    return prisma.faculty.update({ where: { id }, data });
  }

  deleteFaculty(id: number) {
    return prisma.faculty.delete({ where: { id } });
  }

  createStudyProgram(data: Prisma.StudyProgramCreateInput) {
    return prisma.studyProgram.create({ data });
  }

  updateStudyProgram(id: number, data: Prisma.StudyProgramUpdateInput) {
    return prisma.studyProgram.update({ where: { id }, data });
  }

  deleteStudyProgram(id: number) {
    return prisma.studyProgram.delete({ where: { id } });
  }

  createSubject(data: Prisma.SubjectCreateInput) {
    return prisma.subject.create({ data });
  }

  updateSubject(id: number, data: Prisma.SubjectUpdateInput) {
    return prisma.subject.update({ where: { id }, data });
  }

  deleteSubject(id: number) {
    return prisma.subject.delete({ where: { id } });
  }
}

const universitiesModel = new UniversitiesModel();

export { universitiesModel };
