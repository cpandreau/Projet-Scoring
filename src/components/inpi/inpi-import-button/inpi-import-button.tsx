'use client'

import { Building2, Clock, Download, FileText, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  fetchINPIBilanDetail,
  fetchINPIBilans,
  fetchINPICompanyInfo,
  syncINPIToDatabase,
} from '@/actions/inpi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  detectProcedureCollective,
  type ProcedureCollectiveResult,
} from '@/lib/utils/procedure-collective-detector'

import { BilansTab } from './bilans-tab'
import { CompanyInfoTab } from './company-info-tab'
import type { BilansState, CompanyState, INPIImportButtonProps } from './inpi-import-button.types'
import { formatDate } from './inpi-import-button.utils'
import { ProcedureAlert } from './procedure-alert'

/**
 * Bouton + Dialog modal pour visualiser et synchroniser les données INPI
 */
export function INPIImportButton({ siren, dossierId, inpiSyncAt }: INPIImportButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'bilans'>('info')
  const [bilansState, setBilansState] = useState<BilansState>({ type: 'idle' })
  const [companyState, setCompanyState] = useState<CompanyState>({ type: 'idle' })
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<string | null | undefined>(inpiSyncAt)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      loadAll()
    } else {
      setBilansState({ type: 'idle' })
      setCompanyState({ type: 'idle' })
      setActiveTab('info')
    }
  }

  const loadAll = async () => {
    loadCompanyInfo()
    loadBilans()
  }

  const loadCompanyInfo = async () => {
    setCompanyState({ type: 'loading' })
    const result = await fetchINPICompanyInfo(siren)

    if (!result.success || !result.data) {
      setCompanyState({ type: 'error', message: result.error || 'Erreur inconnue' })
      return
    }

    setCompanyState({ type: 'loaded', data: result.data })
  }

  const loadBilans = async () => {
    setBilansState({ type: 'loading' })
    const result = await fetchINPIBilans(siren)

    if (!result.success) {
      setBilansState({ type: 'error', message: result.error || 'Erreur inconnue' })
      return
    }

    if (!result.data || result.data.bilans.length === 0) {
      setBilansState({ type: 'error', message: 'Aucun bilan public disponible' })
      return
    }

    setBilansState({ type: 'loaded', bilans: result.data.bilans })
  }

  const loadBilanDetail = async (bilanId: string) => {
    setBilansState({ type: 'detail-loading', bilanId })
    const result = await fetchINPIBilanDetail(bilanId)

    if (!result.success || !result.data) {
      setBilansState({ type: 'error', message: result.error || 'Erreur lors du chargement' })
      return
    }

    setBilansState({ type: 'detail', bilan: result.data })
  }

  const goBackToList = () => {
    loadBilans()
  }

  const handleSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    try {
      const result = await syncINPIToDatabase(dossierId, siren)

      if (result.success) {
        toast.success('Synchronisation réussie', {
          description: 'Les données INPI ont été enregistrées en base de données',
        })
        setLastSyncAt(result.syncedAt)
        router.refresh()
      } else {
        toast.error('Erreur de synchronisation', {
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Detect procedure collective
  const procedureResult: ProcedureCollectiveResult | null =
    companyState.type === 'loaded'
      ? detectProcedureCollective(companyState.data.observationsRCS)
      : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Importer depuis INPI
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Données INPI
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing || companyState.type !== 'loaded'}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
            </Button>
          </div>
          <DialogDescription>
            SIREN {siren} - Informations du Registre National des Entreprises
            {lastSyncAt && (
              <span className="mt-1 flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                Dernière sync : {formatDate(lastSyncAt)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Alert for collective procedure */}
        {procedureResult?.hasProcedure && <ProcedureAlert procedureResult={procedureResult} />}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'info' | 'bilans')}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="gap-2">
              <Building2 className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="bilans" className="gap-2">
              <FileText className="h-4 w-4" />
              Bilans
              {bilansState.type === 'loaded' && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {bilansState.bilans.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 min-h-0 flex-1">
            <CompanyInfoTab
              state={companyState}
              procedureResult={procedureResult}
              onRetry={loadCompanyInfo}
            />
          </TabsContent>

          <TabsContent value="bilans" className="mt-4 min-h-0 flex-1">
            <BilansTab
              state={bilansState}
              onLoadDetail={loadBilanDetail}
              onBackToList={goBackToList}
              onRetry={loadBilans}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
