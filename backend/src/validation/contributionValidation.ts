import { z } from "zod";

import { RequestValidationError } from "../errors/RequestValidationError.js";

const entityTypeSchema = z.enum(
  ["UNIVERSITY", "FACULTY", "STUDY_PROGRAM", "SUBJECT"],
  {
    error: "Invalid entity type",
  },
);

const parentIdSchema = z.coerce
  .number({
    error: "Parent ID must be a positive integer",
  })
  .int({
    error: "Parent ID must be a positive integer",
  })
  .positive({
    error: "Parent ID must be a positive integer",
  });

const targetIdSchema = z.coerce
  .number({
    error: "Target ID must be a positive integer",
  })
  .int({
    error: "Target ID must be a positive integer",
  })
  .positive({
    error: "Target ID must be a positive integer",
  });

const durationYearsSchema = z.coerce
  .number({
    error: "Duration must be between 1 and 10 years",
  })
  .int({
    error: "Duration must be between 1 and 10 years",
  })
  .min(1, {
    error: "Duration must be between 1 and 10 years",
  })
  .max(10, {
    error: "Duration must be between 1 and 10 years",
  });

const ectsSchema = z.coerce
  .number({
    error: "ECTS must be a positive integer",
  })
  .int({
    error: "ECTS must be a positive integer",
  })
  .positive({
    error: "ECTS must be a positive integer",
  });

const semesterSchema = z.coerce
  .number({
    error: "Semester must be between 1 and 12",
  })
  .int({
    error: "Semester must be between 1 and 12",
  })
  .min(1, {
    error: "Semester must be between 1 and 12",
  })
  .max(12, {
    error: "Semester must be between 1 and 12",
  });

const universityCreateDataSchema = z.strictObject({
  name: z.string().trim().min(1, {
    error: "Name is required",
  }),

  city: z.string().trim().min(1, {
    error: "City is required",
  }),

  entity: z.enum(["FBIH", "RS", "BD"], {
    error: "Invalid entity - must be FBIH, RS, or BD",
  }),

  ownership: z.enum(["JAVNA", "PRIVATNA"], {
    error: "Ownership must be JAVNA or PRIVATNA",
  }),
});

const facultyCreateDataSchema = z.strictObject({
  name: z.string().trim().min(1, {
    error: "Name is required",
  }),

  city: z.string().trim().optional(),
});

const studyProgramCreateDataSchema = z.strictObject({
  name: z.string().trim().min(1, {
    error: "Name is required",
  }),

  cycle: z.enum(["FIRST", "SECOND", "THIRD"], {
    error: "Invalid study cycle - must be FIRST, SECOND, or THIRD",
  }),

  durationYears: durationYearsSchema.nullish(),

  ects: ectsSchema.nullish(),
});

const subjectCreateDataSchema = z.strictObject({
  name: z.string().trim().min(1, {
    error: "Name is required",
  }),

  semester: semesterSchema.nullish(),

  ects: ectsSchema.nullish(),

  type: z
    .enum(["MANDATORY", "ELECTIVE"], {
      error: "Invalid subject type - must be MANDATORY or ELECTIVE",
    })
    .nullish(),
});

const createEntitySchema = z.discriminatedUnion("entityType", [
  z.strictObject({
    entityType: z.literal("UNIVERSITY"),
    data: universityCreateDataSchema,
  }),

  z.strictObject({
    entityType: z.literal("FACULTY"),
    parentId: parentIdSchema,
    data: facultyCreateDataSchema,
  }),

  z.strictObject({
    entityType: z.literal("STUDY_PROGRAM"),
    parentId: parentIdSchema,
    data: studyProgramCreateDataSchema,
  }),

  z.strictObject({
    entityType: z.literal("SUBJECT"),
    parentId: parentIdSchema,
    data: subjectCreateDataSchema,
  }),
]);

const universityEditDataSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(1, {
      error: "Name cannot be empty if provided",
    })
    .optional(),

  city: z.string().trim().optional(),

  entity: z
    .enum(["FBIH", "RS", "BD"], {
      error: "Invalid entity - must be FBIH, RS, or BD",
    })
    .optional(),

  ownership: z
    .enum(["JAVNA", "PRIVATNA"], {
      error: "Ownership must be JAVNA or PRIVATNA",
    })
    .optional(),
});

const facultyEditDataSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(1, {
      error: "Name cannot be empty if provided",
    })
    .optional(),

  city: z.string().trim().optional(),
});

const studyProgramEditDataSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(1, {
      error: "Name cannot be empty if provided",
    })
    .optional(),

  cycle: z
    .enum(["FIRST", "SECOND", "THIRD"], {
      error: "Invalid study cycle",
    })
    .optional(),

  durationYears: durationYearsSchema.nullish(),

  ects: ectsSchema.nullish(),
});

const subjectEditDataSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(1, {
      error: "Name cannot be empty if provided",
    })
    .optional(),

  semester: semesterSchema.nullish(),

  ects: ectsSchema.nullish(),

  type: z
    .enum(["MANDATORY", "ELECTIVE"], {
      error: "Invalid subject type - must be MANDATORY or ELECTIVE",
    })
    .nullish(),
});

const editEntitySchema = z.discriminatedUnion("entityType", [
  z.strictObject({
    entityType: z.literal("UNIVERSITY"),
    targetId: targetIdSchema,
    data: universityEditDataSchema,
  }),

  z.strictObject({
    entityType: z.literal("FACULTY"),
    targetId: targetIdSchema,
    data: facultyEditDataSchema,
  }),

  z.strictObject({
    entityType: z.literal("STUDY_PROGRAM"),
    targetId: targetIdSchema,
    data: studyProgramEditDataSchema,
  }),

  z.strictObject({
    entityType: z.literal("SUBJECT"),
    targetId: targetIdSchema,
    data: subjectEditDataSchema,
  }),
]);

const deleteEntitySchema = z.strictObject({
  entityType: entityTypeSchema,

  targetId: targetIdSchema,
});

const deletePendingChangeSchema = z.strictObject({
  id: z
    .string()
    .trim()
    .min(1, {
      error: "Pending change ID is required",
    })
    .pipe(
      z.uuid({
        error: "Pending change ID must be a valid UUID",
      }),
    ),
});

function createEntity(input: unknown) {
  const result = createEntitySchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

function editEntity(input: unknown) {
  const result = editEntitySchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

function deleteEntity(input: unknown) {
  const result = deleteEntitySchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

function deletePendingChange(input: unknown) {
  const result = deletePendingChangeSchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

export { createEntity, editEntity, deleteEntity, deletePendingChange };
