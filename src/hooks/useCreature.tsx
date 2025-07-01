import { useState, useEffect } from 'react';
import { Creature } from '../types/creature';

interface UseCreatureResult {
  creature: Creature | null;
  loading: boolean;
  error: string | null;
}

export function useCreature(id: string | undefined): UseCreatureResult {
  const [creature, setCreature] = useState<Creature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('No creature ID provided');
      return;
    }

    const fetchCreature = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/creatures/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch creature');
        }

        const data = await response.json();
        setCreature(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCreature(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCreature();
  }, [id]);

  return { creature, loading, error };
}
