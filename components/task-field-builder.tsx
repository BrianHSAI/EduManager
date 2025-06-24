"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { TaskField } from "@/lib/types";

interface TaskFieldBuilderProps {
  fields: TaskField[];
  onAddField: (type: TaskField["type"]) => void;
  onUpdateField: (id: string, updates: Partial<TaskField>) => void;
  onRemoveField: (id: string) => void;
}

export function TaskFieldBuilder({
  fields,
  onAddField,
  onUpdateField,
  onRemoveField,
}: TaskFieldBuilderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => onAddField("text")}>
          + Tekst Felt
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddField("number")}
        >
          + Tal Felt
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddField("multiple-choice")}
        >
          + Multiple Choice
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddField("checkbox")}
        >
          + Afkrydsningsfelt
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {fields.map((field) => (
          <Card key={field.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">
                  {field.type === "text"
                    ? "Tekst"
                    : field.type === "textarea"
                    ? "Tekstområde"
                    : field.type === "number"
                    ? "Tal"
                    : field.type === "multiple-choice"
                    ? "Multiple Choice"
                    : "Afkrydsning"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveField(field.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Spørgsmål/Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) =>
                      onUpdateField(field.id, { label: e.target.value })
                    }
                    placeholder="Indtast spørgsmål..."
                  />
                </div>

                {field.type !== "multiple-choice" && field.type !== "checkbox" && (
                  <div>
                    <Label>Placeholder (valgfri)</Label>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) =>
                        onUpdateField(field.id, { placeholder: e.target.value })
                      }
                      placeholder="Hjælpetekst..."
                    />
                  </div>
                )}

                {(field.type === "text" || field.type === "textarea") && (
                  <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                    <Label className="text-sm font-medium">
                      Færdiggørelseskriterie (valgfri)
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`completion-${field.id}`}
                        checked={!!field.completionCriteria}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onUpdateField(field.id, {
                              completionCriteria: {
                                type: "characters",
                                target: 100,
                              },
                            });
                          } else {
                            onUpdateField(field.id, {
                              completionCriteria: undefined,
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`completion-${field.id}`}
                        className="text-sm"
                      >
                        Sæt mål for færdiggørelse
                      </Label>
                    </div>

                    {field.completionCriteria && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Type</Label>
                            <select
                              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                              value={field.completionCriteria.type}
                              onChange={(e) =>
                                onUpdateField(field.id, {
                                  completionCriteria: {
                                    ...field.completionCriteria!,
                                    type: e.target.value as
                                      | "characters"
                                      | "words"
                                      | "solution",
                                  },
                                })
                              }
                            >
                              <option value="characters">Tegn</option>
                              <option value="words">Ord</option>
                              <option value="solution">Løsning</option>
                            </select>
                          </div>
                          {field.completionCriteria.type !== "solution" && (
                            <div>
                              <Label className="text-xs">Måltal</Label>
                              <Input
                                type="number"
                                min="1"
                                value={field.completionCriteria.target}
                                onChange={(e) =>
                                  onUpdateField(field.id, {
                                    completionCriteria: {
                                      ...field.completionCriteria!,
                                      target: parseInt(e.target.value) || 1,
                                    },
                                  })
                                }
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                        {field.completionCriteria.type === "solution" && (
                          <div>
                            <Label className="text-xs">Forventet løsning</Label>
                            <Input
                              value={field.completionCriteria.solution || ""}
                              onChange={(e) =>
                                onUpdateField(field.id, {
                                  completionCriteria: {
                                    ...field.completionCriteria!,
                                    solution: e.target.value,
                                    target: 1, // Set target to 1 for solution-based completion
                                  },
                                })
                              }
                              placeholder="Indtast den korrekte løsning..."
                              className="text-sm"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {field.type === "multiple-choice" && (
                  <div>
                    <Label>Svarmuligheder</Label>
                    {field.options?.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center space-x-2 mt-2"
                      >
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(field.options || [])];
                            newOptions[optionIndex] = e.target.value;
                            onUpdateField(field.id, { options: newOptions });
                          }}
                          placeholder={`Mulighed ${optionIndex + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOptions = field.options?.filter(
                              (_, i) => i !== optionIndex
                            );
                            onUpdateField(field.id, { options: newOptions });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const newOptions = [...(field.options || []), ""];
                        onUpdateField(field.id, { options: newOptions });
                      }}
                    >
                      + Tilføj Mulighed
                    </Button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`required-${field.id}`}
                    checked={field.required}
                    onChange={(e) =>
                      onUpdateField(field.id, { required: e.target.checked })
                    }
                  />
                  <Label htmlFor={`required-${field.id}`}>Påkrævet felt</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Tilføj felter til din opgave ved at klikke på knapperne ovenfor
          </div>
        )}
      </div>
    </div>
  );
}
