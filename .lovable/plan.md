# Plan: Fireproof-First Architecture with User-Selectable Storage

## Status: ✅ IMPLEMENTED

## Overview

This plan refactored the project storage architecture to use **Fireproof as the default primary storage** while allowing users to select from available database offerings through the Infrastructure Wizard. Vercel remains the deployment platform.

## Completed Changes

### 1. ✅ Refactored `useProjectManager.ts` - Fireproof as Primary

- Changed `saveEnhancedProject` to save to Fireproof FIRST
- Made Supabase sync optional and secondary (cloud backup when authenticated)
- Updated `getUserProjects` to prioritize local Fireproof projects
- Added export/import functionality for project backup

### 2. ✅ Created `useStorageProvider.ts` Hook

- Reads the user's selected database from infrastructure config
- Provides a unified storage interface
- Supports switching between Fireproof (default), Supabase, OrbitDB, Gun.js, Ceramic
- Persists config to localStorage
- Monitors online/offline status

### 3. ✅ Updated Infrastructure Wizard Integration

- Pre-selects Fireproof as the default database option
- Shows "Default: Fireproof (Local-first, Offline-ready)" indicator
- Passes selected database configuration to the project save flow

### 4. ✅ Updated Workspace Builder

- Displays current storage provider in the UI
- Shows online/offline status indicator
- Shows cloud sync badge when enabled

### 5. ✅ Enhanced `useFireproof.ts`

- Added `exportDatabase` and `importToDatabase` functions
- Added `getProject` and `getAllProjects` helpers
- Added `clearDatabase` for data management

## Benefits Achieved

1. **Offline-first**: Users can work without internet, projects save locally
2. **Faster saves**: Local Fireproof saves are nearly instant
3. **User choice**: Power users can select alternative databases via Infrastructure Wizard
4. **Reliability**: No dependency on Supabase for basic project saving
5. **Deployment ready**: Vercel deployment remains unchanged

## File Changes Summary

| File | Status | Description |
|------|--------|-------------|
| `src/hooks/useProjectManager.ts` | ✅ Modified | Fireproof first, Supabase optional sync |
| `src/hooks/useStorageProvider.ts` | ✅ Created | Unified storage provider hook |
| `src/hooks/useFireproof.ts` | ✅ Modified | Added export/import and helpers |
| `src/components/InfrastructureWizard.tsx` | ✅ Modified | Pre-select Fireproof, show indicator |
| `src/components/WorkspaceBuilder.tsx` | ✅ Modified | Display storage provider status |


