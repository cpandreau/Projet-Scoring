# Audit des Calculs de Ratios Financiers

**Date :** 2026-01-21
**Fichiers audités :**
- `src/lib/ratios/calculate.ts`
- `src/config/ratios.config.ts`
- `src/config/cerfa-mapping.config.ts`
- `src/schemas/extraction.schema.ts`

---

## 1. Résumé Exécutif

### Problèmes Critiques Identifiés

| Priorité | Ratio/Agrégat | Problème |
|----------|---------------|----------|
| CRITIQUE | Passif circulant | Calcul simplifié incorrect (devrait utiliser détail des dettes) |
| CRITIQUE | BFR | Calcul simplifié (manque certaines créances/dettes) |
| CRITIQUE | FRNG | Formule simplifiée vs document de référence |
| CRITIQUE | Capacité de remboursement | Utilise Résultat Net au lieu de CAF |
| MAJEUR | EBE | Manque les subventions d'exploitation |
| MAJEUR | Rentabilité économique | Utilise EBE au lieu de Résultat d'exploitation |
| MINEUR | ratio_fonds_roulement | Formule incohérente dans config vs calcul |

---

## 2. Analyse Détaillée par Ratio

### 2.1 LIQUIDITÉ

#### 2.1.1 Liquidité Générale

| Aspect | Valeur |
|--------|--------|
| **Nom** | liquidite_generale |
| **Formule attendue** | (Actif circulant / Passif circulant) × 100 |
| **Formule actuelle** | `safeDivide(actif_circulant, passif_circulant) × 100` |
| **Champs utilisés** | `actif_circulant`, `passif_circulant` (calculé) |
| **Écart identifié** | Le passif_circulant est calculé comme `total_passif - capitaux_propres - dettes_financieres`. Cette formule est une APPROXIMATION. Le passif circulant devrait être : dettes fournisseurs + dettes fiscales/sociales + autres dettes CT + produits constatés d'avance |

**Recommandation :** Ajouter l'extraction des dettes fiscales et sociales pour un calcul précis.

#### 2.1.2 Liquidité Immédiate

| Aspect | Valeur |
|--------|--------|
| **Nom** | liquidite_immediate |
| **Formule attendue** | (Disponibilités / Passif circulant) × 100 |
| **Formule actuelle** | `safeDivide(disponibilites, passif_circulant) × 100` |
| **Champs utilisés** | `disponibilites`, `passif_circulant` (calculé) |
| **Écart identifié** | Même problème que liquidité générale (passif circulant approximatif) |

#### 2.1.3 Couverture du BFR

| Aspect | Valeur |
|--------|--------|
| **Nom** | couverture_bfr |
| **Formule attendue (config)** | (BFR / Fonds de roulement) × 100 |
| **Formule actuelle (calculate.ts)** | `safeDivide(bfr, frng) × 100` |
| **Écart identifié** | AUCUN - Formule correcte |

---

### 2.2 RENTABILITÉ

#### 2.2.1 Taux de Rentabilité Financière

| Aspect | Valeur |
|--------|--------|
| **Nom** | taux_rentabilite_financiere |
| **Formule attendue** | (Résultat net / Capitaux propres) × 100 |
| **Formule actuelle** | `safeDivide(resultat_net, capitaux_propres) × 100` |
| **Champs utilisés** | `resultat_net`, `capitaux_propres` |
| **Écart identifié** | AUCUN - Formule correcte |

**Note :** La formule de référence CERFA utilise parfois CAF/Capitaux propres pour la rentabilité financière.

#### 2.2.2 Rentabilité Économique

| Aspect | Valeur |
|--------|--------|
| **Nom** | rentabilite_economique |
| **Formule attendue (config)** | (Résultat d'exploitation / Total actif) × 100 |
| **Formule actuelle (calculate.ts)** | `safeDivide(ebe, actif_immobilise + bfr) × 100` |
| **Champs utilisés** | `ebe`, `actif_immobilise`, `bfr` |
| **Écart identifié** | **INCOHÉRENCE MAJEURE** |

**Problèmes :**
1. La config dit "Résultat d'exploitation / Total actif"
2. Le code utilise "EBE / (Actif immobilisé + BFR)"
3. Ce sont deux ratios différents !

**Recommandation :** Aligner la formule du code avec la config, ou clarifier qu'il s'agit de deux ratios distincts (rentabilité économique vs ROCE).

#### 2.2.3 Taux de Valeur Ajoutée

| Aspect | Valeur |
|--------|--------|
| **Nom** | taux_va |
| **Formule attendue** | (Valeur ajoutée / Chiffre d'affaires) × 100 |
| **Formule actuelle** | `safeDivide(va, chiffre_affaires) × 100` |
| **Calcul VA** | `CA - achats_marchandises - achats_matieres_premieres - autres_charges_externes` |
| **Formule CERFA** | Marge commerciale + Production - Consommations intermédiaires |
| **Écart identifié** | **SIMPLIFICATION** - La VA actuelle ne prend pas en compte la production stockée/immobilisée ni les variations de stocks |

**Formule complète selon CERFA :**
```
VA = (Ventes march. - Achats march. - Var stock march.)
   + (Production vendue + stockée + immobilisée)
   - (Achats MP + Var stock MP + Charges externes)
```

#### 2.2.4 Taux d'EBE

| Aspect | Valeur |
|--------|--------|
| **Nom** | taux_ebe |
| **Formule attendue** | (EBE / Chiffre d'affaires) × 100 |
| **Formule actuelle EBE** | `VA - impots_taxes - charges_personnel` |
| **Formule CERFA EBE** | VA + Subventions d'exploitation - Impôts taxes - Charges personnel |
| **Écart identifié** | **MANQUE LES SUBVENTIONS D'EXPLOITATION** |

**Recommandation :**
1. Ajouter `subventions_exploitation` à l'extraction
2. Modifier le calcul EBE : `EBE = VA + subventions - impots - charges_personnel`

#### 2.2.5 Taux de Marge Brute

| Aspect | Valeur |
|--------|--------|
| **Nom** | taux_marge_brute |
| **Formule config** | (EBE / Valeur ajoutée) × 100 |
| **Formule actuelle** | `safeDivide(ebe, va) × 100` |
| **Écart identifié** | AUCUN - Formule correcte |

#### 2.2.6 Taux de Marge Industrielle

| Aspect | Valeur |
|--------|--------|
| **Nom** | taux_marge_industrielle |
| **Formule attendue** | (Production - Achats MP - Charges ext) / Production × 100 |
| **Formule actuelle** | `(production - achats_matieres_premieres - autres_charges_externes) / production × 100` |
| **Champs utilisés** | `production`, `achats_matieres_premieres`, `autres_charges_externes` |
| **Écart identifié** | AUCUN - Formule correcte |

#### 2.2.7 Taux de Marge Commerciale

| Aspect | Valeur |
|--------|--------|
| **Nom** | taux_marge_commerciale |
| **Formule attendue** | (Ventes march. - Achats march.) / Ventes march. × 100 |
| **Formule actuelle** | `(ventes_marchandises - achats_marchandises) / ventes_marchandises × 100` |
| **Écart identifié** | **INCOMPLET** - La marge commerciale devrait inclure la variation de stock de marchandises |

**Formule correcte :**
```
Marge commerciale = Ventes - (Achats + Variation stock)
```

#### 2.2.8 Charges / VA (Personnel, Financières, Impôts)

| Ratio | Formule | Statut |
|-------|---------|--------|
| charges_personnel_va | Charges personnel / VA × 100 | OK |
| charges_financieres_va | Charges financières / VA × 100 | OK |
| impots_taxes_va | Impôts taxes / VA × 100 | OK |

---

### 2.3 SOLVABILITÉ

#### 2.3.1 Capacité de Remboursement

| Aspect | Valeur |
|--------|--------|
| **Nom** | capacite_remboursement |
| **Formule config** | (Dettes financières / CAF) × 360 |
| **Formule actuelle** | `(dettes_financieres / resultat_net) × 360` |
| **Écart identifié** | **CRITIQUE - Utilise Résultat Net au lieu de CAF** |

**Commentaire dans le code :**
> "Note: On utilise le résultat net comme approximation de la CAF"

**Impact :** Le résultat net peut être très différent de la CAF (dotations aux amortissements non prises en compte). Une entreprise peut avoir un résultat net faible mais une CAF élevée.

**Recommandation :** Calculer la CAF selon la formule CERFA :
```
CAF = Résultat net
    + Dotations amortissements (GA, GB, GC)
    + Dotations provisions financières (GR, GS)
    + Charges exceptionnelles sur capital (HF)
    - Reprises sur provisions exploitation (FP)
    - Reprises sur provisions financières (GM, GO, GP)
    - Produits exceptionnels sur capital (HC, HD)
```

#### 2.3.2 Taux d'Endettement

| Aspect | Valeur |
|--------|--------|
| **Nom** | taux_endettement |
| **Formule attendue** | (Dettes financières / Capitaux propres) × 100 |
| **Formule actuelle** | `safeDivide(dettes_financieres, capitaux_propres) × 100` |
| **Écart identifié** | AUCUN - Formule correcte |

#### 2.3.3 Autonomie Financière

| Aspect | Valeur |
|--------|--------|
| **Nom** | autonomie_financiere |
| **Formule attendue** | (Capitaux propres / Total passif) × 100 |
| **Formule actuelle** | `safeDivide(capitaux_propres, total_passif) × 100` |
| **Note** | `total_passif` est calculé comme `actif_immobilise + actif_circulant` |
| **Écart identifié** | OK si total_passif est extrait directement (EE du 2051) |

#### 2.3.4 Équilibre Financier Global

| Aspect | Valeur |
|--------|--------|
| **Nom** | equilibre_global |
| **Formule config** | (Fonds de roulement / BFR) × 100 |
| **Formule actuelle** | `(capitaux_propres + dettes_financieres) / (actif_immobilise + bfr) × 100` |
| **Écart identifié** | **FORMULE DIFFÉRENTE** - Le code calcule un ratio de couverture des emplois stables, pas FR/BFR |

**Recommandation :** Utiliser `safeDivide(frng, bfr) × 100` pour correspondre à la config.

#### 2.3.5 Poids du Découvert

| Aspect | Valeur |
|--------|--------|
| **Nom** | poids_decouvert |
| **Formule attendue** | (Découvert bancaire / Dettes financières) × 100 |
| **Formule actuelle** | `safeDivide(decouvert_bancaire, dettes_financieres) × 100` |
| **Écart identifié** | AUCUN - Formule correcte |

---

### 2.4 ACTIVITÉ

#### 2.4.1 Ratio de Fonds de Roulement

| Aspect | Valeur |
|--------|--------|
| **Nom** | ratio_fonds_roulement |
| **Formule config** | Fonds de roulement / Actif circulant |
| **Formule actuelle** | `(capitaux_propres + dettes_financieres) / actif_immobilise` |
| **Écart identifié** | **FORMULE DIFFÉRENTE** - Le code calcule le ratio de couverture de l'actif immobilisé, pas FR/AC |

**Recommandation :** Aligner avec la config : `safeDivide(frng, actif_circulant)`

#### 2.4.2 Délai Fournisseurs (DPO)

| Aspect | Valeur |
|--------|--------|
| **Nom** | delai_fournisseurs |
| **Formule attendue** | (Dettes fournisseurs × 360) / Achats TTC |
| **Formule actuelle** | `(dettes_fournisseurs × 360) / ((achats_march + achats_MP + charges_ext) × 1.2)` |
| **Coefficient TTC** | **1.2 (TVA 20%) - CORRECT** |
| **Écart identifié** | AUCUN - Formule correcte |

#### 2.4.3 Délai Clients (DSO)

| Aspect | Valeur |
|--------|--------|
| **Nom** | delai_clients |
| **Formule attendue** | (Créances clients × 360) / CA TTC |
| **Formule actuelle** | `(creances_clients × 360) / (chiffre_affaires × 1.2)` |
| **Coefficient TTC** | **1.2 (TVA 20%) - CORRECT** |
| **Écart identifié** | AUCUN - Formule correcte |

#### 2.4.4 Rotation des Stocks

| Aspect | Valeur |
|--------|--------|
| **Nom** | rotation_stocks |
| **Formule attendue** | (Stocks × 360) / (Achats march. + Achats MP) |
| **Formule actuelle** | `(stocks × 360) / (achats_marchandises + achats_matieres_premieres)` |
| **Écart identifié** | AUCUN - Formule correcte |

**Note :** Certaines méthodologies utilisent le coût des ventes au dénominateur plutôt que les achats.

#### 2.4.5 Cash Flow d'Exploitation

| Aspect | Valeur |
|--------|--------|
| **Nom** | cash_flow_exploitation |
| **Formule attendue** | EBE / (BFR N - BFR N-1) |
| **Formule actuelle** | `safeDivide(ebe, bfr_n - bfr_n1)` |
| **Écart identifié** | AUCUN - Formule correcte (nécessite données N-1) |

---

## 3. Points Critiques Spécifiques

### 3.1 Calcul du Passif Court Terme

**Actuel :**
```typescript
passif_circulant = total_passif - capitaux_propres - dettes_financieres
```

**Problème :** Cette formule est une approximation qui peut inclure des éléments incorrects (provisions pour risques et charges, etc.)

**Formule CERFA précise :**
```
Passif circulant = DV (avances acomptes) + DW (avances acomptes reçus)
                 + DX (dettes fournisseurs) + DY (dettes fiscales/sociales)
                 + DZ + EA (autres dettes) + EB (produits constatés d'avance)
```

**Recommandation :** Extraire `dettes_fiscales_sociales` et `autres_dettes` pour un calcul précis.

### 3.2 Calcul du FRNG

**Actuel :**
```typescript
frng = (capitaux_propres + dettes_financieres) - actif_immobilise
```

**Formule CERFA complète :**
```
FRNG = (DL + DO + DP + DQ + DR + DS + DT) - BK
     = Capitaux propres + Provisions risques/charges + Emprunts obligataires
       + Emprunts établ. crédit + Emprunts divers - Actif immobilisé
```

**Différence :** Les provisions pour risques et charges (DO + DP = case 150 simplifiée) ne sont pas incluses dans le calcul actuel.

**Recommandation :** Ajouter `provisions_risques_charges` à l'extraction et au calcul du FRNG.

### 3.3 Calcul du BFR

**Actuel :**
```typescript
bfr = actif_circulant - disponibilites - dettes_fournisseurs
```

**Formule CERFA complète :**
```
BFR = (Stocks + Créances clients + Autres créances + VMP + Charges constatées d'avance)
    - (Avances acomptes reçus + Dettes fournisseurs + Dettes fiscales/sociales
       + Autres dettes + Produits constatés d'avance)
```

**Différence :** Le calcul actuel est simplifié et ne tient pas compte de toutes les composantes.

### 3.4 Utilisation de la CAF

**Problème majeur :** La CAF n'est pas calculée dans le système actuel.

**Champs nécessaires pour calculer la CAF :**
- `dotations_amortissements_exploitation` (GA)
- `dotations_provisions_exploitation` (GB + GC)
- `reprises_provisions_exploitation` (FP)
- `dotations_provisions_financieres` (GR + GS)
- `produits_exceptionnels` (pour plus/moins values)
- `charges_exceptionnelles` (pour plus/moins values)

**Formule CAF (méthode additive) :**
```
CAF = Résultat net
    + Dotations amortissements (GA)
    + Dotations provisions exploitation (GB + GC)
    + Dotations provisions financières (GR + GS)
    + VNC des éléments cédés (HE partie)
    - Reprises sur provisions exploitation (FP)
    - Reprises sur provisions financières (GM + GO + GP)
    - Prix de cession (HC + HD partie)
    - Quote-part subventions virée au résultat (partie de FO)
```

---

## 4. Ratios du Document de Référence NON Implémentés

Les ratios suivants sont définis dans `cerfa-mapping.config.ts` (SIG_FIELDS) mais ne sont **pas calculés** dans `calculate.ts` :

| Ratio | Description | Priorité |
|-------|-------------|----------|
| `marge_commerciale` | Ventes - Coût d'achat marchandises vendues | HAUTE |
| `production_exercice` | Production vendue + stockée + immobilisée | MOYENNE |
| `valeur_ajoutee` | Marge + Production - Consommations | HAUTE (calculé partiellement) |
| `ebe` | VA + Subventions - Impôts - Charges personnel | HAUTE (calculé partiellement) |
| `caf` | Capacité d'autofinancement | CRITIQUE |
| `fonds_roulement` | Ressources stables - Emplois stables | MOYENNE (approx. calculé) |
| `bfr` | Actif circulant HT - Passif circulant HT | MOYENNE (approx. calculé) |
| `tresorerie_nette` | FR - BFR = Disponibilités - Découverts | BASSE |

---

## 5. Champs Extraits NON Utilisés dans les Calculs

Les champs suivants sont définis dans `extraction.schema.ts` mais **ne sont pas utilisés** dans `calculate.ts` :

| Champ extrait | Potentiel d'utilisation |
|---------------|------------------------|
| `type_liasse` | Pourrait influencer les formules (normale vs simplifiée) |
| `total_passif` | Utilisé indirectement (calculé via actifs) - devrait être utilisé directement |

**Note :** La plupart des champs extraits sont utilisés. Le champ `type_liasse` pourrait permettre d'ajuster certains calculs selon le type de liasse.

---

## 6. Recommandations par Priorité

### CRITIQUE (À corriger immédiatement)

1. **Implémenter le calcul de la CAF**
   - Ajouter les champs d'extraction nécessaires
   - Modifier `capacite_remboursement` pour utiliser la CAF

2. **Corriger le calcul de l'EBE**
   - Ajouter `subventions_exploitation` à l'extraction et au calcul

3. **Aligner rentabilité économique**
   - Décider entre la formule config (RE/Total actif) et le code (EBE/Capitaux investis)
   - Documenter clairement le choix

### MAJEUR (À planifier)

4. **Améliorer le calcul du passif circulant**
   - Extraire `dettes_fiscales_sociales` et `autres_dettes`

5. **Améliorer le calcul du FRNG**
   - Ajouter `provisions_risques_charges`

6. **Corriger les formules incohérentes**
   - `equilibre_global` : utiliser FR/BFR
   - `ratio_fonds_roulement` : utiliser FR/Actif circulant

### MINEUR (Améliorations)

7. **Améliorer la marge commerciale**
   - Inclure la variation de stock de marchandises

8. **Améliorer le calcul de la VA**
   - Inclure production stockée/immobilisée et variations de stocks

---

## 7. Conclusion

Le système actuel de calcul de ratios fonctionne avec des **approximations acceptables** pour une première version, mais présente plusieurs écarts significatifs par rapport aux formules comptables de référence.

Les trois problèmes les plus critiques sont :
1. L'absence de calcul de la CAF (impacte la capacité de remboursement)
2. L'EBE sans subventions d'exploitation
3. Les incohérences entre la configuration (`ratios.config.ts`) et l'implémentation (`calculate.ts`)

**Score de conformité estimé : 70%**

La mise en conformité complète nécessite :
- L'extraction de ~5 champs supplémentaires
- La modification de ~8 formules de calcul
- L'ajout du calcul de la CAF
