"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { TaskField, Group, TaskResource } from "@/lib/types";
import { TaskFieldBuilder } from "./task-field-builder";
import { TaskAssignmentSelector } from "./task-assignment-selector";

interface NewTaskData {
  title: string;
  description: string;
  subject: string;
  groupId: string;
  dueDate: string;
  assignmentType: "class" | "individual";
}

interface TaskCreationDialogProps {
  groups: Group[];
  onCreateTask: (
    taskData: NewTaskData,
    fields: TaskField[],
    selectedStudents: string[]
  ) => void;
}

export function TaskCreationDialog({
  groups,
  onCreateTask,
}: TaskCreationDialogProps) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [currentStep, setCurrentStep] = useState("basic");
  const [newTask, setNewTask] = useState<NewTaskData>({
    title: "",
    description: "",
    subject: "",
    groupId: "",
    dueDate: "",
    assignmentType: "class",
  });
  const [taskFields, setTaskFields] = useState<TaskField[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [taskResources, setTaskResources] = useState<TaskResource[]>([]);

  const addField = (type: TaskField["type"]) => {
    const newField: TaskField = {
      id: `field_${Date.now()}`,
      type,
      label: "",
      required: false,
      placeholder: type === "multiple-choice" ? undefined : "",
      options: type === "multiple-choice" ? [""] : undefined,
    };
    setTaskFields([...taskFields, newField]);
  };

  const updateField = (id: string, updates: Partial<TaskField>) => {
    setTaskFields((fields) =>
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id: string) => {
    setTaskFields((fields) => fields.filter((field) => field.id !== id));
  };

  const addResource = () => {
    const newResource: TaskResource = {
      id: `resource_${Date.now()}`,
      title: "",
      url: "",
      description: "",
    };
    setTaskResources([...taskResources, newResource]);
  };

  const updateResource = (id: string, updates: Partial<TaskResource>) => {
    setTaskResources((resources) =>
      resources.map((resource) =>
        resource.id === id ? { ...resource, ...updates } : resource
      )
    );
  };

  const removeResource = (id: string) => {
    setTaskResources((resources) =>
      resources.filter((resource) => resource.id !== id)
    );
  };

  const handleCreateTask = () => {
    onCreateTask(newTask, taskFields, selectedStudents);
    setShowCreateTask(false);
    setCurrentStep("basic");
    setNewTask({
      title: "",
      description: "",
      subject: "",
      groupId: "",
      dueDate: "",
      assignmentType: "class",
    });
    setTaskFields([]);
    setSelectedStudents([]);
    setTaskResources([]);
  };

  const handleCloseDialog = () => {
    setShowCreateTask(false);
    setCurrentStep("basic");
  };

  const handleNextStep = () => {
    if (currentStep === "basic") {
      setCurrentStep("fields");
    } else if (currentStep === "fields") {
      setCurrentStep("resources");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "fields") {
      setCurrentStep("basic");
    } else if (currentStep === "resources") {
      setCurrentStep("fields");
    }
  };

  const isBasicStepValid = () => {
    const basicValid = newTask.title.trim() && newTask.subject;

    if (newTask.assignmentType === "class") {
      return basicValid && newTask.groupId;
    } else {
      return basicValid && selectedStudents.length > 0;
    }
  };

  const isFormValid = () => {
    return isBasicStepValid() && taskFields.length > 0;
  };

  const canProceedToNext = () => {
    if (currentStep === "basic") {
      return isBasicStepValid();
    }
    return true;
  };

  return (
    <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Opret Opgave
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Opret Ny Opgave</DialogTitle>
          <DialogDescription>
            Opret en ny opgave med tilpassede felter til dine elever
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Grundlæggende Info</TabsTrigger>
            <TabsTrigger value="fields">Opgave Felter</TabsTrigger>
            <TabsTrigger value="resources">Ressourcer</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskTitle">Opgave Titel</Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="f.eks. Grundlæggende Addition"
                />
              </div>
              <div>
                <Label htmlFor="taskSubject">Fag</Label>
                <Input
                  id="taskSubject"
                  value={newTask.subject}
                  onChange={(e) =>
                    setNewTask({ ...newTask, subject: e.target.value })
                  }
                  placeholder="f.eks. Matematik, Dansk, Engelsk..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="taskDescription">Beskrivelse</Label>
              <Textarea
                id="taskDescription"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Beskriv opgaven..."
              />
            </div>

            <TaskAssignmentSelector
              assignmentType={newTask.assignmentType}
              selectedStudents={selectedStudents}
              selectedGroup={newTask.groupId}
              groups={groups}
              onAssignmentTypeChange={(type) =>
                setNewTask({ ...newTask, assignmentType: type })
              }
              onStudentSelectionChange={setSelectedStudents}
              onGroupSelectionChange={(groupId) =>
                setNewTask({ ...newTask, groupId })
              }
            />

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="taskDueDate">Afleveringsfrist (valgfri)</Label>
                <Input
                  id="taskDueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className=""
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <TaskFieldBuilder
              fields={taskFields}
              onAddField={addField}
              onUpdateField={updateField}
              onRemoveField={removeField}
            />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Ressourcer og Links</h3>
                <p className="text-sm text-muted-foreground">
                  Tilføj nyttige links og ressourcer som eleverne kan bruge til
                  opgaven
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addResource}>
                <Plus className="h-4 w-4 mr-2" />
                Tilføj Ressource
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {taskResources.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Ressource</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Titel</Label>
                          <Input
                            value={resource.title}
                            onChange={(e) =>
                              updateResource(resource.id, {
                                title: e.target.value,
                              })
                            }
                            placeholder="f.eks. Khan Academy - Addition"
                          />
                        </div>
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={resource.url}
                            onChange={(e) =>
                              updateResource(resource.id, {
                                url: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            type="url"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Beskrivelse (valgfri)</Label>
                        <Textarea
                          value={resource.description || ""}
                          onChange={(e) =>
                            updateResource(resource.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Kort beskrivelse af ressourcen..."
                          rows={2}
                        />
                      </div>

                      {resource.url && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <ExternalLink className="h-4 w-4" />
                          <span>Link vil åbne i ny fane for eleverne</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {taskResources.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Ingen ressourcer tilføjet endnu. Klik på "Tilføj Ressource"
                  for at komme i gang.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex space-x-2">
            {currentStep !== "basic" && (
              <Button variant="outline" onClick={handlePreviousStep}>
                Tilbage
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Annuller
            </Button>
            {currentStep === "basic" && (
              <Button onClick={handleNextStep} disabled={!canProceedToNext()}>
                Gå videre
              </Button>
            )}
            {currentStep === "fields" && (
              <Button onClick={handleNextStep}>
                Gå videre
              </Button>
            )}
            {currentStep === "resources" && (
              <Button onClick={handleCreateTask} disabled={!isFormValid()}>
                Opret Opgave
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
