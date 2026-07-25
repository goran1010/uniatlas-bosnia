import { useEffect, useState, use } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Spinner } from "../../utils/Spinner";
import { UniversityCard } from "./UniversityCard";
import { BACKEND_URL } from "../../utils/envConfig";
import { readErrorMessage } from "../../schemas/api";
import { universityListResponseSchema } from "../../schemas/university";

export type Entity = "RS" | "FBIH" | "BD";
export type Ownership = "JAVNA" | "PRIVATNA";

export interface University {
  id: number;
  name: string;
  acronym?: string;
  city: string;
  entity: Entity;
  ownership: Ownership;
  foundedYear?: string;
  website?: string;
  accreditationFrom?: string;
  accreditationTo?: string;
  authority?: string;
  sourceUrl?: string;
  lastChecked?: string;
  faculties: Faculty[];
}

export interface Faculty {
  id: number;
  name: string;
  universityId: number;
  university: University;
  city?: string;
  website?: string;
  studyPrograms: StudyProgram[];
}

export interface StudyProgram {
  id: number;
  name: string;
  facultyId: number;
  cycle: "BACHELOR" | "MASTER" | "DOCTORATE";
  durationYears?: number;
  ects?: number;
  language?: string;
  sourceUrl?: string;
  subjects: Subject[];
}

export interface Subject {
  id: number;
  name: string;
  studyProgramId: number;
  semester?: number;
  ects?: number;
  type?: "MANDATORY" | "ELECTIVE";
  sourceUrl?: string;
}

function GetAllUniversities() {
  const { t, addNotification } = use(RootContext);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUniversities() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/v1/universities`, {
          method: "GET",
          mode: "cors",
        });

        if (res.ok) {
          const result = universityListResponseSchema.parse(await res.json());
          setUniversities(result.data);
        } else {
          const serverMessage = readErrorMessage(await res.json());
          if (serverMessage) {
            console.warn("Failed to load universities:", serverMessage);
          }
          addNotification({
            type: "error",
            message: t("messages.universities.loadError"),
          });
        }
      } catch {
        addNotification({
          type: "error",
          message: t("messages.universities.loadError"),
        });
      } finally {
        setLoading(false);
      }
    }
    void fetchUniversities();
  }, [addNotification, t]);

  if (loading) return <Spinner />;

  if (!universities.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
        {t("universitiesPage.noResults")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3 w-full">
      {universities.map((u) => (
        <UniversityCard key={u.id} university={u} />
      ))}
    </ul>
  );
}

export { GetAllUniversities };
