'use client'

import { CheckCircle2, FileText, FileUp, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type FileWithMetadata, useUploadDocuments } from '@/hooks'
import { cn } from '@/lib/utils'
import { AVAILABLE_YEARS, DOCUMENT_TYPES, type DocumentType } from '@/types/document'

interface DocumentUploadProps {
  enterpriseId: string
}

interface FilePreviewItem {
  file: File
  annee: number | null
  type: DocumentType | null
  id: string // Pour les animations
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`
}

export function DocumentUpload({ enterpriseId }: DocumentUploadProps) {
  const { uploading, error, success, upload, clearMessages } = useUploadDocuments(enterpriseId)
  const [previewFiles, setPreviewFiles] = useState<FilePreviewItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [justDropped, setJustDropped] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelect = useCallback(
    (files: FileList | null) => {
      clearMessages()
      setValidationError(null)

      if (!files || files.length === 0) return

      const newPreviewItems: FilePreviewItem[] = []
      const invalidFiles: string[] = []

      Array.from(files).forEach((file) => {
        if (file.type === 'application/pdf') {
          newPreviewItems.push({
            file,
            annee: null,
            type: null,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
          })
        } else {
          invalidFiles.push(file.name)
        }
      })

      if (invalidFiles.length > 0) {
        setValidationError(`Fichiers non PDF ignorés : ${invalidFiles.join(', ')}`)
      }

      if (newPreviewItems.length > 0) {
        // Animation de confirmation
        setJustDropped(true)
        setTimeout(() => setJustDropped(false), 600)
      }

      setPreviewFiles((prev) => [...prev, ...newPreviewItems])
    },
    [clearMessages]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Vérifier qu'on quitte vraiment la zone (pas un enfant)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      handleFilesSelect(e.dataTransfer.files)
    },
    [handleFilesSelect]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelect(e.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateFileYear = (index: number, value: string) => {
    setPreviewFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, annee: value === 'none' ? null : parseInt(value, 10) } : item
      )
    )
  }

  const updateFileType = (index: number, value: string) => {
    setPreviewFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, type: value === 'none' ? null : (value as DocumentType) } : item
      )
    )
  }

  const handleUpload = async () => {
    const filesWithMetadata: FileWithMetadata[] = previewFiles.map((item) => ({
      file: item.file,
      annee: item.annee,
      type: item.type,
    }))

    const result = await upload(filesWithMetadata)
    if (result.success) {
      setPreviewFiles([])
    }
  }

  const removeFile = (index: number) => {
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const clearAllFiles = () => {
    setPreviewFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayError = error || validationError
  const hasFiles = previewFiles.length > 0

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
          <div className="fade-in slide-in-from-top-2 flex animate-in items-center gap-2 rounded-md bg-red-50 p-3 text-red-500 text-sm duration-200 dark:bg-red-950">
            <X className="h-4 w-4 shrink-0" />
            {displayError}
          </div>
        )}

        {success && (
          <div className="fade-in slide-in-from-top-2 flex animate-in items-center gap-2 rounded-md bg-green-50 p-3 text-green-600 text-sm duration-200 dark:bg-green-950">
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
            'relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200',
            isDragging
              ? 'scale-[1.02] border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : justDropped
                ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
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
                'mx-auto flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200',
                isDragging
                  ? 'scale-110 bg-blue-100 dark:bg-blue-900/50'
                  : justDropped
                    ? 'bg-green-100 dark:bg-green-900/50'
                    : 'bg-muted'
              )}
            >
              {isDragging ? (
                <FileUp className="h-7 w-7 animate-bounce text-blue-500" />
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
                  <p className="font-medium">Glissez vos fichiers PDF ici</p>
                  <p className="text-muted-foreground text-sm">ou cliquez pour sélectionner</p>
                </>
              )}
            </div>

            {/* Badge format */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs">
              <FileText className="h-3 w-3" />
              PDF uniquement
            </div>
          </div>
        </div>

        {/* Liste des fichiers */}
        {hasFiles && (
          <div className="fade-in slide-in-from-bottom-2 animate-in space-y-3 duration-300">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-sm">
                {previewFiles.length} fichier{previewFiles.length > 1 ? 's' : ''} sélectionné
                {previewFiles.length > 1 ? 's' : ''}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFiles}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="mr-1 h-4 w-4" />
                Tout effacer
              </Button>
            </div>

            <div className="max-h-80 divide-y overflow-y-auto rounded-lg border">
              {previewFiles.map((item, index) => (
                <div
                  key={item.id}
                  className="group fade-in slide-in-from-left-2 animate-in space-y-3 p-3 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    {/* Icône PDF */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/50">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>

                    {/* Infos fichier */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{item.file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>

                    {/* Bouton supprimer */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sélecteurs année et type */}
                  <div className="flex flex-col gap-2 pl-13 sm:flex-row">
                    <Select
                      value={item.annee?.toString() || 'none'}
                      onValueChange={(value) => updateFileYear(index, value)}
                    >
                      <SelectTrigger className="h-8 w-full text-xs sm:w-35">
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
                      value={item.type || 'none'}
                      onValueChange={(value) => updateFileType(index, value)}
                    >
                      <SelectTrigger className="h-8 w-full text-xs sm:w-50">
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Uploader{' '}
                  {previewFiles.length > 1 ? `(${previewFiles.length} fichiers)` : '(1 fichier)'}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
