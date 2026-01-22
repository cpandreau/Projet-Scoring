"use client";

import { useState, useCallback } from "react";

interface UseLoadingOptions {
  initialLoading?: boolean;
  initialMessage?: string;
}

interface UseLoadingReturn {
  isLoading: boolean;
  message: string | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(
    asyncFn: () => Promise<T>,
    message?: string
  ) => Promise<T>;
}

/**
 * Hook pour gérer un état de chargement avec message optionnel
 */
export function useLoading(options: UseLoadingOptions = {}): UseLoadingReturn {
  const { initialLoading = false, initialMessage = null } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [message, setMessage] = useState<string | null>(initialMessage);

  const startLoading = useCallback((loadingMessage?: string) => {
    setIsLoading(true);
    setMessage(loadingMessage ?? null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setMessage(null);
  }, []);

  /**
   * Exécute une fonction async en gérant automatiquement l'état de chargement
   */
  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>, loadingMessage?: string): Promise<T> => {
      startLoading(loadingMessage);
      try {
        return await asyncFn();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    message,
    startLoading,
    stopLoading,
    withLoading,
  };
}

/**
 * Hook pour gérer plusieurs états de chargement par clé
 */
export function useLoadingMap<K extends string = string>() {
  const [loadingMap, setLoadingMap] = useState<Map<K, string | null>>(new Map());

  const isLoading = useCallback(
    (key: K): boolean => loadingMap.has(key),
    [loadingMap]
  );

  const getMessage = useCallback(
    (key: K): string | null => loadingMap.get(key) ?? null,
    [loadingMap]
  );

  const startLoading = useCallback((key: K, message?: string) => {
    setLoadingMap((prev) => {
      const next = new Map(prev);
      next.set(key, message ?? null);
      return next;
    });
  }, []);

  const stopLoading = useCallback((key: K) => {
    setLoadingMap((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const withLoading = useCallback(
    async <T>(key: K, asyncFn: () => Promise<T>, message?: string): Promise<T> => {
      startLoading(key, message);
      try {
        return await asyncFn();
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    getMessage,
    startLoading,
    stopLoading,
    withLoading,
    hasAnyLoading: loadingMap.size > 0,
  };
}
