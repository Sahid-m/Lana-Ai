import { BACKEND_URL } from "@/config";
import { formatDate } from "@/utils/formatDate";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
type Project = {
  id: string;
  description: string;
  createdAt: string;
};

export function useProjects(debouncedString: string) {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<{ [date: string]: Project[] }>({});
  const fetchProjects = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const filteredProjects = debouncedString
        ? response.data.projects.filter((project: Project) =>
            project.description
              .toLowerCase()
              .includes(debouncedString.toLowerCase())
          )
        : response.data.projects;

      const projectsByDate = filteredProjects.reduce(
        (acc: { [date: string]: Project[] }, project: Project) => {
          const date = formatDate(project.createdAt);
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(project);
          return acc;
        },
        {}
      );
      setProjects(projectsByDate);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, [getToken, debouncedString]);

  useEffect(() => {
    fetchProjects();
  }, [debouncedString]);

  return projects;
}
