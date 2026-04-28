import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useAdminSettings() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (!error) {
        setSettings(data);
      }
    }

    fetchSettings();
  }, []);

  return settings;
}
