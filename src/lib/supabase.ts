import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rbjdekamtxevjchhrsux.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiamRla2FtdHhldmpjaGhyc3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyMTksImV4cCI6MjA2ODY2OTIxOX0.O_84bIaqP0zG3Oncff5b50YjuPB466Ixbsolhru9dOQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface VentaContratoRecord {
  id_venta: number;
  id_cliente: number;
  id_inventario: number;
  fecha_venta: string;
  precio_lista?: number;
  precio_venta: number;
  estatus: 'Vendida' | 'Rescindida' | 'Apartada';
  categoria: string;
  created_at: string;
  updated_at: string;
}

export interface VentaPagoRecord {
  id_pago: number;
  id_venta: number;
  monto: number;
  fecha_pago: string;
  fecha_vencimiento?: string;
  concepto_pago: string;
  estatus_pago: 'Pagado' | 'Pendiente' | 'Vencido' | 'Parcial';
  metodo_pago?: string;
  referencia?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteRecord {
  id_cliente: number;
  nombre: string;
  apellidos: string;
  correo?: string;
  celular?: string;
  created_at: string;
  updated_at: string;
}

export interface InventarioRecord {
  id_inventario: number;
  num_unidad?: string;
  estatus: string;
  categoria?: string;
  nivel?: number;
  vista?: string;
  m2_interior?: number;
  m2_exterior?: number;
  m2_total?: number;
  fase?: string;
  id_proyecto?: number;
  created_at: string;
  updated_at: string;
}

export interface ProyectoRecord {
  id_proyecto: number;
  nombre: string;
  created_at: string;
}

// Service functions
export const ventasService = {
  // Get all sales contracts
  async getVentasContratos() {
    const { data, error } = await supabase
      .from('ventas_contratos')
      .select(`
        *,
        clientes(nombre, apellidos),
        inventario(num_unidad, id_proyecto)
      `)
      .order('fecha_venta', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get sales contracts by project
  async getVentasContratosByProject(proyectoId: number) {
    const { data, error } = await supabase
      .from('ventas_contratos')
      .select(`
        *,
        clientes(nombre, apellidos),
        inventario!inner(num_unidad, id_proyecto)
      `)
      .eq('inventario.id_proyecto', proyectoId)
      .order('fecha_venta', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get all payment records
  async getAllPagos() {
    const { data, error } = await supabase
      .from('venta_pagos')
      .select(`
        *,
        ventas_contratos(
          id_cliente,
          id_inventario,
          clientes(nombre, apellidos),
          inventario(num_unidad, id_proyecto)
        )
      `)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get payment records by project
  async getPagosByProject(proyectoId: number) {
    const { data, error } = await supabase
      .from('venta_pagos')
      .select(`
        *,
        ventas_contratos!inner(
          id_cliente,
          id_inventario,
          clientes(nombre, apellidos),
          inventario!inner(num_unidad, id_proyecto)
        )
      `)
      .eq('ventas_contratos.inventario.id_proyecto', proyectoId)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get payments for a specific sale
  async getPagosByVenta(ventaId: number) {
    const { data, error } = await supabase
      .from('venta_pagos')
      .select('*')
      .eq('id_venta', ventaId)
      .order('fecha_pago', { ascending: true });
    
    if (error) throw error;
    return data as VentaPagoRecord[];
  }
};

export const clientesService = {
  async getClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data as ClienteRecord[];
  },

  async getClienteById(id: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as ClienteRecord;
  }
};

export const inventarioService = {
  async getInventario() {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .order('num_unidad', { ascending: true });
    
    if (error) throw error;
    return data as InventarioRecord[];
  },

  async getInventarioByProject(proyectoId: number) {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .eq('id_proyecto', proyectoId)
      .order('num_unidad', { ascending: true });
    
    if (error) throw error;
    return data as InventarioRecord[];
  },

  async getInventarioByUnit(idInventario: number) {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .eq('id_inventario', idInventario)
      .single();
    
    if (error) throw error;
    return data as InventarioRecord;
  }
};

export const proyectosService = {
  async getProyectos() {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data as ProyectoRecord[];
  },

  async getProyectoById(id: number) {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .eq('id_proyecto', id)
      .single();
    
    if (error) throw error;
    return data as ProyectoRecord;
  }
};