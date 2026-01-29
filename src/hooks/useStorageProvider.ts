import { useState, useEffect, useCallback } from 'react';
import { useFireproofProjects, Project } from './useFireproof';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type StorageProviderType = 'fireproof' | 'supabase' | 'orbitdb' | 'gunjs' | 'ceramic';

export interface StorageConfig {
  provider: StorageProviderType;
  cloudSync: boolean;
  autoBackup: boolean;
}

export interface StorageStatus {
  isOnline: boolean;
  lastSyncAt: string | null;
  pendingChanges: number;
  provider: StorageProviderType;
}

const DEFAULT_CONFIG: StorageConfig = {
  provider: 'fireproof',
  cloudSync: false,
  autoBackup: true
};

const STORAGE_CONFIG_KEY = 'remixable-storage-config';

export const useStorageProvider = () => {
  const [config, setConfig] = useState<StorageConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) {
        try {
          return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
        } catch {
          return DEFAULT_CONFIG;
        }
      }
    }
    return DEFAULT_CONFIG;
  });

  const [status, setStatus] = useState<StorageStatus>({
    isOnline: true,
    lastSyncAt: null,
    pendingChanges: 0,
    provider: config.provider
  });

  // Persist config changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    }
  }, [config]);

  // Update status when provider changes
  useEffect(() => {
    setStatus(prev => ({ ...prev, provider: config.provider }));
  }, [config.provider]);

  const updateConfig = useCallback((updates: Partial<StorageConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const setProvider = useCallback((provider: StorageProviderType) => {
    updateConfig({ provider });
  }, [updateConfig]);

  const toggleCloudSync = useCallback((enabled: boolean) => {
    updateConfig({ cloudSync: enabled });
  }, [updateConfig]);

  const getProviderInfo = useCallback((providerId: StorageProviderType) => {
    const providers: Record<StorageProviderType, { name: string; icon: string; description: string }> = {
      fireproof: {
        name: 'Fireproof',
        icon: '🔥',
        description: 'Local-first with real-time sync'
      },
      supabase: {
        name: 'Supabase',
        icon: '⚡',
        description: 'Cloud PostgreSQL with realtime'
      },
      orbitdb: {
        name: 'OrbitDB',
        icon: '🌐',
        description: 'Decentralized on IPFS'
      },
      gunjs: {
        name: 'Gun.js',
        icon: '🔫',
        description: 'Real-time P2P graph database'
      },
      ceramic: {
        name: 'Ceramic',
        icon: '🏺',
        description: 'Decentralized data network'
      }
    };
    return providers[providerId];
  }, []);

  const syncToCloud = useCallback(async () => {
    if (!config.cloudSync) return false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      setStatus(prev => ({
        ...prev,
        lastSyncAt: new Date().toISOString(),
        pendingChanges: 0
      }));
      
      return true;
    } catch (error) {
      console.error('Cloud sync failed:', error);
      return false;
    }
  }, [config.cloudSync]);

  const checkOnlineStatus = useCallback(() => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setStatus(prev => ({ ...prev, isOnline }));
    return isOnline;
  }, []);

  // Monitor online status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    config,
    status,
    setProvider,
    toggleCloudSync,
    updateConfig,
    getProviderInfo,
    syncToCloud,
    checkOnlineStatus,
    isFireproof: config.provider === 'fireproof',
    isCloudBacked: config.provider === 'supabase' || config.cloudSync
  };
};
