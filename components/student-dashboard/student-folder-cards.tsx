import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { TaskFolder } from "@/lib/types";
import { FolderContextMenu } from "@/components/folder-context-menu";

interface FolderStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  remainingTasks: number;
}

interface StudentFolderCardsProps {
  folders: TaskFolder[];
  getFolderStatistics: (folderId: string) => FolderStatistics;
  onFolderClick: (folderId: string) => void;
  onFolderUpdated?: () => void;
  activeFolderId?: string | null;
}

export function StudentFolderCards({
  folders,
  getFolderStatistics,
  onFolderClick,
  onFolderUpdated,
  activeFolderId,
}: StudentFolderCardsProps) {
  if (folders.length === 0) {
    return (
      <div className="text-center py-8">
        <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Ingen mapper oprettet
        </h3>
        <p className="text-sm text-muted-foreground">
          Opret mapper for at organisere dine opgaver
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {folders.map((folder) => {
        const stats = getFolderStatistics(folder.id);
        const folderColor = folder.color || "#6366f1";
        const isActive = activeFolderId === folder.id;

        return (
          <FolderContextMenu
            key={folder.id}
            folder={folder}
            onFolderUpdated={onFolderUpdated}
            onFolderDeleted={onFolderUpdated}
          >
            <Card
              className={`cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${
                isActive 
                  ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg bg-blue-50/50" 
                  : ""
              }`}
              style={{ borderLeftColor: folderColor }}
              onClick={() => onFolderClick(folder.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle
                  className="truncate text-base font-medium underline"
                  title={folder.name}
                >
                  {folder.name}
                </CardTitle>
                <Folder
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: folderColor }}
                />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="font-medium text-green-600">
                        {stats.completedTasks}
                      </span>
                    </div>
                    <p className="text-muted-foreground">Færdige</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="h-3 w-3 text-blue-600" />
                      <span className="font-medium text-blue-600">
                        {stats.inProgressTasks}
                      </span>
                    </div>
                    <p className="text-muted-foreground">I gang</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <AlertCircle className="h-3 w-3 text-orange-600" />
                      <span className="font-medium text-orange-600">
                        {stats.remainingTasks}
                      </span>
                    </div>
                    <p className="text-muted-foreground">Mangler</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">
                      {stats.totalTasks} opgaver
                    </span>
                  </div>
                  {stats.totalTasks > 0 && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (stats.completedTasks / stats.totalTasks) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        {Math.round(
                          (stats.completedTasks / stats.totalTasks) * 100
                        )}
                        % færdig
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Klik for at se opgaver
                </p>
              </CardContent>
            </Card>
          </FolderContextMenu>
        );
      })}
    </div>
  );
}
