import { useState, useEffect, useCallback } from 'react';
import { playerDataService } from '@/services/playerDataService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PlayerResult } from '@/types/playerData';

export const useEnrichedPlayerData = () => {
    const [players, setPlayers] = useState<PlayerResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const loadAndEnrichData = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Load basic JSON data
            await playerDataService.loadPlayerData();
            const rawData = playerDataService.getRawData();

            if (rawData.length === 0) {
                setPlayers([]);
                setIsLoading(false);
                return;
            }

            // 2. Enrich with Supabase Data (State/City)
            const mobileNumbers = rawData.map(p => p.mobile);
            const chunkSize = 500;
            const dbPlayersMap = new Map();

            // Fetch in chunks
            for (let i = 0; i < mobileNumbers.length; i += chunkSize) {
                const chunk = mobileNumbers.slice(i, i + chunkSize);
                const { data: dbPlayers, error } = await supabase
                    .from('player_registrations')
                    .select('phone, city, state')
                    .in('phone', chunk);

                if (error) console.error('Supabase fetch error:', error);

                if (dbPlayers) {
                    dbPlayers.forEach(p => dbPlayersMap.set(p.phone, p));
                }
            }

            // 3. Merge Data
            const enriched = rawData.map(player => {
                const dbPlayer = dbPlayersMap.get(player.mobile);
                return {
                    ...player,
                    city: dbPlayer?.city || player.city || 'N/A',
                    state: (player.state && player.state.trim() !== '') ? player.state : (dbPlayer?.state || 'N/A'),
                };
            });

            setPlayers(enriched);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load player data.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadAndEnrichData();
    }, [loadAndEnrichData]);

    return { players, isLoading, refresh: loadAndEnrichData };
};
