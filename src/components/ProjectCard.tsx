"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Edit, FolderOpen, Badge } from "lucide-react";
import { Project } from "@/types/project"
import { useRouter } from "next/navigation";

type ProjectCardProps = {
    project: Project;
    onDelete?: (id: string) => void;
    onEdit?: (project: Project) => void;
};

// Full standardized papercard look
export default function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {

    // Create a route system for text
    const router = useRouter();

    return (

        <div
            className="bg-white rounded-xl shadow-md p-5 h-full w-full flex flex-col 
        transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl"
        >
            {/* Title */}
            <div className="heading-carved flex items-start justify-between">
                <h3
                    className="text-gray-700 font-semibold cursor-pointer text-3xl"
                    title={project.title}
                >
                    {project.title ?? "Untitled"}

                </h3>

                <FolderOpen className="text-gray-400 w-5 h-5" />
            </div>

            {/* Metadata */}
            <div className="mt-1 text-md text-gray-700">
                Created: {new Date(project.createdAt).toISOString().slice(0, 10)}
                {project.contributors && <span className="line-clamp-1">{project.contributors}</span>}
            </div>

            <div className="flex-1" />

            {/* Project card content */}
            <div className="space-y-4">

                {/* Goal */}
                <div className="mt-1 text-md text-gray-500">
                    {project.goal}
                </div>

                {/* Pinned Papers */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">Pinned Papers</span>
                        <span
                            className={[
                                "inline-flex items-center justify-center",
                                "w-6 h-6 rounded-full border border-gray-300",
                                "text-sm font-medium text-gray-800 bg-white"
                            ].join(" ")}
                        >
                            2
                        </span>
                    </div>
                </div>

                {/* Experiment Ideas */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">Experiment Ideas</span>
                        <span
                            className={[
                                "inline-flex items-center justify-center",
                                "w-6 h-6 rounded-full border border-gray-300",
                                "text-sm font-medium text-gray-800 bg-white"
                            ].join(" ")}
                        >
                            1
                        </span>
                    </div>
                </div>

                {/* Notes */}
                {project.notes && (
                    <div className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-md">
                        <strong>Notes:</strong> {project.notes}
                    </div>
                )}

                {/* Open Project */}
                <div className="pt-2">
                    <Button size="sm" variant="outline" className="w-full bg-gray-50 hover:bg-gray-200 font-semibold">
                        Open Project
                    </Button>
                </div>

            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">

                {/* Edit project */}
                <Button
                    variant="ghost"
                    className="text-md text-blue-500 font-semibold hover:bg-gray-200 transition-colors flex text-center h-10"
                    onClick={() => onEdit?.(project)}
                >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                </Button>

                {/* Delete project */}
                <Button
                    variant="ghost"
                    className="text-md text-red-500 font-semibold hover:bg-gray-200 transition-colors flex text-center h-10"
                    onClick={() => onDelete?.(project.id)}
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                </Button>

            </div>

        </div>
    );
}