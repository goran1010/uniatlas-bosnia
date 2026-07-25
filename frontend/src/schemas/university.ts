import { z } from "zod";

const optionalTextSchema = z
  .string()
  .nullish()
  .transform((value) => value ?? undefined);

const universityListItemSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    acronym: optionalTextSchema,
    city: z.string().min(1),
    entity: z.enum(["FBIH", "RS", "BD"]),
    ownership: z.enum(["JAVNA", "PRIVATNA"]),
    foundedYear: optionalTextSchema,
    website: optionalTextSchema,
    accreditationFrom: optionalTextSchema,
    accreditationTo: optionalTextSchema,
    authority: optionalTextSchema,
    sourceUrl: optionalTextSchema,
    lastChecked: optionalTextSchema,
  })
  .transform((university) => ({ ...university, faculties: [] }));

const universityListResponseSchema = z.object({
  message: z.string(),
  data: z.array(universityListItemSchema),
});

export { universityListResponseSchema };
