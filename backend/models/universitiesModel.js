import { prisma } from "../db/prisma.js";

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

class UniversitiesModel {
  getAll() {
    return prisma.university.findMany({ orderBy: { name: "asc" } });
  }

  getById(id) {
    return prisma.university.findUnique({
      where: { id },
      include: fullUniversityInclude,
    });
  }

  searchUniversities(term) {
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

  searchStudyPrograms(term) {
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

  getFacultyById(id) {
    return prisma.faculty.findUnique({ where: { id } });
  }

  getStudyProgramById(id) {
    return prisma.studyProgram.findUnique({ where: { id } });
  }

  getSubjectById(id) {
    return prisma.subject.findUnique({ where: { id } });
  }

  createUniversity(data) {
    return prisma.university.create({ data });
  }

  updateUniversity(id, data) {
    return prisma.university.update({ where: { id }, data });
  }

  deleteUniversity(id) {
    return prisma.university.delete({ where: { id } });
  }

  createFaculty(data) {
    return prisma.faculty.create({ data });
  }

  updateFaculty(id, data) {
    return prisma.faculty.update({ where: { id }, data });
  }

  deleteFaculty(id) {
    return prisma.faculty.delete({ where: { id } });
  }

  createStudyProgram(data) {
    return prisma.studyProgram.create({ data });
  }

  updateStudyProgram(id, data) {
    return prisma.studyProgram.update({ where: { id }, data });
  }

  deleteStudyProgram(id) {
    return prisma.studyProgram.delete({ where: { id } });
  }

  createSubject(data) {
    return prisma.subject.create({ data });
  }

  updateSubject(id, data) {
    return prisma.subject.update({ where: { id }, data });
  }

  deleteSubject(id) {
    return prisma.subject.delete({ where: { id } });
  }
}

const universitiesModel = new UniversitiesModel();

export { universitiesModel };
