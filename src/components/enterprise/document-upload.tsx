"use client";

import { useState, useRef, useCallback } from "react";
import { useUploadDocuments, type FileWithMetadata } from "@/hooks";
import { AVAILABLE_YEARS, DOCUMENT_TYPES, type DocumentType } from "@/types/document";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUp, FileText, X, Loader2, CheckCircle2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  enterpriseId: string;
}

interface FilePreviewItem {
  file: File;
  annee: number | null;
  type: DocumentType | null;
  id: string; // Pour les animations
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

export function DocumentUpload({ enterpriseId }: DocumentUploadProps) {
  const { uploading, error, success, upload, clearMessages } = useUploadDocuments(enterpriseId);
  const [previewFiles, setPreviewFiles] = useState<FilePreviewItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = useCallback((files: FileList | null) => {
    clearMessages();
    setValidationError(null);

    if (!files || files.length === 0) return;

    const newPreviewItems: FilePreviewItem[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type === "application/pdf") {
        newPreviewItems.push({
          file,
          annee: null,
          type: null,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setValidationError(`Fichiers non PDF ignorés : ${invalidFiles.join(", ")}`);
    }

    if (newPreviewItems.length > 0) {
      // Animation de confirmation
      setJustDropped(true);
      setTimeout(() => setJustDropped(false), 600);
    }

    setPreviewFiles((prev) => [...prev, ...newPreviewItems]);
  }, [clearMessages]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Vérifier qu'on quitte vraiment la zone (pas un enfant)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFilesSelect(e.dataTransfer.files);
  }, [handleFilesSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateFileYear = (index: number, value: string) => {
    setPreviewFiles((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, annee: value === "none" ? null : parseInt(value, 10) }
          : item
      )
    );
  };

  const updateFileType = (index: number, value: string) => {
    setPreviewFiles((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, type: value === "none" ? null : (value as DocumentType) }
          : item
      )
    );
  };

  const handleUpload = async () => {
    const filesWithMetadata: FileWithMetadata[] = previewFiles.map((item) => ({
      file: item.file,
      annee: item.annee,
      type: item.type,
    }));

    const result = await upload(filesWithMetadata);
    if (result.success) {
      setPreviewFiles([]);
    }
  };

  const removeFile = (index: number) => {
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setPreviewFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = error || validationError;
  const hasFiles = previewFiles.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Ajouter des documents
        </CardTitle>
        <CardDescription>
          Glissez-déposez vos fichiers PDF ou cliquez pour parcourir
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayError && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md animate-in fade-in slide-in-from-top-2 duration-200">
            <X className="h-4 w-4 shrink-0" />
            {displayError}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950 rounded-md animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Zone de drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.02]"
              : justDropped
              ? "border-green-500 bg-green-50 dark:bg-green-950/30"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="space-y-3">
            {/* Icône animée */}
            <div
              className={cn(
                "mx-auto w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
                isDragging
                  ? "bg-blue-100 dark:bg-blue-900/50 scale-110"
                  : justDropped
                  ? "bg-green-100 dark:bg-green-900/50"
                  : "bg-muted"
              )}
            >
              {isDragging ? (
                <FileUp className="h-7 w-7 text-blue-500 animate-bounce" />
              ) : justDropped ? (
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              ) : (
                <Upload className="h-7 w-7 text-muted-foreground" />
              )}
            </div>

            {/* Texte */}
            <div>
              {isDragging ? (
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  Déposez vos fichiers ici
                </p>
              ) : (
                <>
                  <p className="font-medium">
                    Glissez vos fichiers PDF ici
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou cliquez pour sélectionner
                  </p>
                </>
              )}
            </div>

            {/* Badge format */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              PDF uniquement
            </div>
          </div>
        </div>

        {/* Liste des fichiers */}
        {hasFiles && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {previewFiles.length} fichier{previewFiles.length > 1 ? "s" : ""} sélectionné{previewFiles.length > 1 ? "s" : ""}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFiles}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Tout effacer
              </Button>
            </div>

            <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
              {previewFiles.map((item, index) => (
                <div
                  key={item.id}
                  className="group p-3 space-y-3 animate-in fade-in slide-in-from-left-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    {/* Icône PDF */}
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>

                    {/* Infos fichier */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>

                    {/* Bouton supprimer */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sélecteurs année et type */}
                  <div className="flex flex-col sm:flex-row gap-2 pl-13">
                    <Select
                      value={item.annee?.toString() || "none"}
                      onValueChange={(value) => updateFileYear(index, value)}
                    >
                      <SelectTrigger className="h-8 text-xs w-full sm:w-35">
                        <SelectValue placeholder="Année" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Année (optionnel)</SelectItem>
                        {AVAILABLE_YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={item.type || "none"}
                      onValueChange={(value) => updateFileType(index, value)}
                    >
                      <SelectTrigger className="h-8 text-xs w-full sm:w-50">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Type (optionnel)</SelectItem>
                        {DOCUMENT_TYPES.map((docType) => (
                          <SelectItem key={docType.value} value={docType.value}>
                            {docType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton upload */}
            <Button
              onClick={handleUpload}
              disabled={uploading || !hasFiles}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader {previewFiles.length > 1 ? `(${previewFiles.length} fichiers)` : "(1 fichier)"}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
