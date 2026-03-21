import { supabase } from './supabaseClient';

export interface Aerodromo {
  id: number;
  indicativo: string;
  nome: string;
  concessionaria: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  heading_geral: number;
  zoom?: number;
}

export interface PistaConfiguracao {
  id: number;
  aerodromo_id: number;
  pista_identificador: string;
  dep_taxiway: string;
  arr_taxiway: string;
  dist_dep_cabeceira: number;
  dist_dep_intersecao: number;
  dist_arr_cabeceira: number;
  dist_arr_intersecao: number;
  rot_dep_cabeceira: number;
  rot_dep_intersecao: number;
  rot_arr_cabeceira: number;
  rot_arr_intersecao: number;
  taxi_dep_cabeceira: number;
  taxi_dep_intersecao: number;
  taxi_arr_cabeceira: number;
  taxi_arr_intersecao: number;
  omni_antiga: number;
  omni_otimizada: number;
  destaque: boolean;
}

let aerodromosCache: Aerodromo[] | null = null;
let pistasCache: PistaConfiguracao[] | null = null;

export const aerodromeService = {
  async getAerodromos(forceRefresh = false): Promise<Aerodromo[]> {
    if (aerodromosCache && !forceRefresh) return aerodromosCache;

    const { data, error } = await supabase
      .from('aerodromos')
      .select('*')
      .order('indicativo');
    
    if (error) throw error;
    aerodromosCache = data || [];
    return aerodromosCache;
  },

  async getPistasConfiguracao(aerodromoId?: number, forceRefresh = false): Promise<PistaConfiguracao[]> {
    if (!pistasCache || forceRefresh) {
      const { data, error } = await supabase.from('pistas_configuracao').select('*');
      if (error) throw error;
      pistasCache = data || [];
    }
    
    if (aerodromoId) {
      return pistasCache.filter(p => p.aerodromo_id === aerodromoId);
    }
    return pistasCache;
  },

  async createPistaConfiguracao(pista: Omit<PistaConfiguracao, 'id' | 'created_at'>): Promise<PistaConfiguracao> {
    const { data, error } = await supabase
      .from('pistas_configuracao')
      .insert([pista])
      .select()
      .single();
    if (error) throw error;
    if (pistasCache) pistasCache.push(data); // Update cache
    return data;
  },

  async deletePistaConfiguracao(id: number): Promise<void> {
    const { error } = await supabase
      .from('pistas_configuracao')
      .delete()
      .eq('id', id);
    if (error) throw error;
    if (pistasCache) pistasCache = pistasCache.filter(p => p.id !== id); // Update cache
  },

  async updatePistaConfiguracao(id: number, updates: Partial<PistaConfiguracao>): Promise<PistaConfiguracao> {
    const { data, error } = await supabase
      .from('pistas_configuracao')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (pistasCache) {
      const index = pistasCache.findIndex(p => p.id === id);
      if (index !== -1) pistasCache[index] = data;
    }
    return data;
  }
};
