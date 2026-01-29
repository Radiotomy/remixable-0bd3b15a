

# Plan: Fireproof-First Architecture with User-Selectable Storage

## Overview

This plan refactors the project storage architecture to use **Fireproof as the default primary storage** while allowing users to select from available database offerings through the Infrastructure Wizard. Vercel remains the deployment platform.

## Current Architecture Issues

1. **Wrong priority order**: The `useProjectManager` hook currently saves to Supabase first and uses Fireproof only as backup
2. **No user choice**: Users cannot select their preferred storage backend during project creation
3. **Confusing persistence**: Projects sometimes don't appear because they're stored in Supabase but the sync may fail

## Proposed Changes

### 1. Refactor `useProjectManager.ts` - Fireproof as Primary

Update the project manager to use Fireproof as the **default primary storage**:

- Change `saveEnhancedProject` to save to Fireproof first
- Make Supabase sync optional and secondary (for cloud backup when authenticated)
- Update `getUserProjects` to prioritize local Fireproof projects
- Add a storage preference setting that respects user's infrastructure selection

### 2. Add Storage Provider Configuration

Create a new `useStorageProvider.ts` hook that:

- Reads the user's selected database from infrastructure config
- Provides a unified storage interface
- Supports switching between Fireproof (default), Supabase, OrbitDB, Gun.js, etc.
- Falls back to Fireproof if selected provider is unavailable

### 3. Update Infrastructure Wizard Integration

Modify `InfrastructureWizard.tsx` to:

- Pre-select Fireproof as the default database option
- Pass selected database configuration to the project save flow
- Show clear messaging that Fireproof is the recommended default

### 4. Update Workspace Builder

Modify `WorkspaceBuilder.tsx` to:

- Use the selected storage provider from infrastructure config
- Display current storage provider in the UI
- Show sync status for cloud-backed projects

### 5. Enhance `useFireproof.ts`

Add additional capabilities:

- Cloud sync toggle (optional Fireproof Cloud sync)
- Export/import functionality for backup
- Project migration between storage providers

## Technical Details

### File Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/hooks/useProjectManager.ts` | Modify | Swap priority: Fireproof first, Supabase optional sync |
| `src/hooks/useStorageProvider.ts` | Create | New unified storage provider hook |
| `src/hooks/useFireproof.ts` | Modify | Add cloud sync and migration features |
| `src/components/InfrastructureWizard.tsx` | Modify | Pre-select Fireproof, improve UX |
| `src/components/WorkspaceBuilder.tsx` | Modify | Display storage provider, use selection |
| `src/data/infrastructure.ts` | Modify | Mark Fireproof as default, add provider integration info |

### Storage Priority Flow

```text
User Creates Project
        |
        v
Check Infrastructure Config
        |
        +---> [No selection] --> Use Fireproof (default)
        |
        +---> [Has selection] --> Use selected provider
                                        |
                                        v
                               Save to selected DB
                                        |
                                        v
                        [If authenticated + cloud provider]
                                        |
                                        v
                              Sync to cloud backup
```

### Default Recommended Stack Update

The `getRecommendedStack` function will continue to return Fireproof as the default database for all app types, ensuring consistency.

## Benefits

1. **Offline-first**: Users can work without internet, projects save locally
2. **Faster saves**: Local Fireproof saves are nearly instant
3. **User choice**: Power users can select alternative databases
4. **Reliability**: No dependency on Supabase for basic project saving
5. **Deployment ready**: Vercel deployment remains unchanged

## Implementation Order

1. Refactor `useProjectManager.ts` to prioritize Fireproof
2. Create `useStorageProvider.ts` for unified interface
3. Update InfrastructureWizard defaults and UI
4. Enhance WorkspaceBuilder to show storage provider
5. Test project creation and persistence flow
6. Add sync status indicators for cloud-backed storage

