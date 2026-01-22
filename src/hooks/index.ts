// Document hooks
export {
  useDocuments,
  useUploadDocuments,
  useUpdateDocument,
  useDeleteDocument,
  useDocumentUrl,
  type FileWithMetadata,
} from "./use-documents";

// Enterprise hooks
export {
  useSireneSearch,
  useCreateEnterprise,
  useUpdateEnterpriseStatus,
  useDeleteEnterprise,
  useFormAutoFill,
} from "./use-enterprise";

export { useCurrentEnterprise } from "./use-current-enterprise";

// Navigation hooks
export { useBreadcrumb, type BreadcrumbItem } from "./use-breadcrumb";

// Extraction hooks
export {
  useExtraction,
  useUpdateExtraction,
  useValidateExtraction,
} from "./use-extraction";

// Document status
export {
  getDocumentStatus,
  getDocumentsSummary,
  type DocumentStatus,
  type DocumentStatusInfo,
} from "./use-document-status";

// Loading hooks
export { useLoading, useLoadingMap } from "./use-loading";

// Theme hook
export { useTheme, type Theme } from "./use-theme";
