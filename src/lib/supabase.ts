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
  nombre_cliente: string;
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
  proyectos?: {
    nombre: string;
    id_desarrollador?: number;
  };
}

export interface VentaRecord {
  id_venta: number;
  id_cliente: number;
  id_inventario: number;
  fecha_venta: string;
  precio_lista?: number;
  precio_venta: number;
  estatus: string;
  categoria: string;
  clientes?: {
    nombre_cliente: string;
  };
  inventario?: {
    num_unidad?: string;
    id_proyecto?: number;
  };
}

export interface PagoRecord {
  id_pago: number;
  id_venta: number;
  monto: number;
  fecha_pago: string;
  fecha_vencimiento?: string;
  concepto_pago: string;
  estatus_pago: string;
  ventas_contratos?: {
    inventario?: {
      num_unidad?: string;
      id_proyecto?: number;
    };
  };
}

export interface ProyectoRecord {
  id_proyecto: number;
  nombre: string;
  id_desarrollador?: number;
  created_at: string;
}

export interface DesarrolladorRecord {
  id_desarrollador: number;
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
        inventario(num_unidad, id_proyecto),
        clientes(nombre_cliente)
      `)
      .order('fecha_venta', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get sales contracts by project using the complete view
  async getVentasContratosByProject(proyectoId: number) {
    // First get project name to filter by
    const { data: proyecto, error: proyectoError } = await supabase
      .from('proyectos')
      .select('nombre')
      .eq('id_proyecto', proyectoId)
      .single();
    
    if (proyectoError) throw proyectoError;
    
    const { data, error } = await supabase
      .from('vw_cliente_panel')
      .select('*')
      .eq('proyecto_nombre', proyecto.nombre)
      .order('fecha_venta', { ascending: false });
    
    if (error) throw error;
    
    // Transform data to match expected interface
    return data?.map(item => ({
      id_venta: item.id_venta,
      id_cliente: item.id_cliente,
      id_inventario: 0, // Not needed in view
      fecha_venta: item.fecha_venta,
      precio_lista: item.precio_lista,
      precio_venta: item.precio_venta,
      estatus: item.estatus,
      categoria: 'Departamento',
      clientes: {
        nombre_cliente: item.nombre_cliente,
        correo: null // Not available in view but could be added
      },
      inventario: {
        num_unidad: item.num_unidad,
        id_proyecto: proyectoId
      }
    })) || [];
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
          inventario(num_unidad, id_proyecto)
        )
      `)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get payment records by project using the complete view
  async getPagosByProject(proyectoId: number) {
    // First get project name to filter by
    const { data: proyecto, error: proyectoError } = await supabase
      .from('proyectos')
      .select('nombre')
      .eq('id_proyecto', proyectoId)
      .single();
    
    if (proyectoError) throw proyectoError;
    
    const { data, error } = await supabase
      .from('vw_historial_pagos')
      .select('*')
      .eq('proyecto_nombre', proyecto.nombre)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match PagoRecord interface
    return data?.map(item => ({
      id_pago: item.id_pago,
      id_venta: item.id_venta,
      monto: item.monto,
      fecha_pago: item.fecha_pago,
      fecha_vencimiento: item.fecha_vencimiento,
      concepto_pago: item.concepto_pago,
      estatus_pago: item.estatus_pago,
      ventas_contratos: {
        clientes: {
          nombre_cliente: item.nombre_cliente,
          correo: null // Not available in view
        },
        inventario: {
          num_unidad: item.num_unidad,
          id_proyecto: proyectoId
        }
      }
    })) || [];
  },

  // Get sales contracts by desarrollador using the view
  async getVentasContratosByDesarrollador(desarrolladorId: number) {
    // First get project names for this developer
    const { data: proyectos } = await supabase
      .from('proyectos')
      .select('nombre')
      .eq('id_desarrollador', desarrolladorId);
    
    if (!proyectos || proyectos.length === 0) return [];
    
    const projectNames = proyectos.map(p => p.nombre);
    
    const { data, error } = await supabase
      .from('vw_developer_cartera')
      .select('*')
      .in('proyecto_nombre', projectNames)
      .order('fecha_venta', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match VentaRecord interface
    return data?.map(item => ({
      id_venta: item.id_venta,
      id_cliente: item.id_cliente,
      id_inventario: 0, // Not available in view
      fecha_venta: item.fecha_venta,
      precio_lista: item.precio_lista,
      precio_venta: item.precio_venta,
      estatus: item.estatus,
      categoria: item.tipo_unidad || 'Departamento',
      clientes: {
        nombre_cliente: item.nombre_cliente
      },
      inventario: {
        num_unidad: item.num_unidad,
        id_proyecto: null // Not available in view
      }
    })) || [];
  },

  // Get payment records by desarrollador using the historial view
  async getPagosByDesarrollador(desarrolladorId: number) {
    // First get project names for this developer
    const { data: proyectos } = await supabase
      .from('proyectos')
      .select('nombre')
      .eq('id_desarrollador', desarrolladorId);
    
    if (!proyectos || proyectos.length === 0) return [];
    
    const projectNames = proyectos.map(p => p.nombre);
    
    const { data, error } = await supabase
      .from('vw_historial_pagos')
      .select('*')
      .in('proyecto_nombre', projectNames)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match PagoRecord interface
    return data?.map(item => ({
      id_pago: item.id_pago,
      id_venta: item.id_venta,
      monto: item.monto,
      fecha_pago: item.fecha_pago,
      fecha_vencimiento: item.fecha_vencimiento,
      concepto_pago: item.concepto_pago,
      estatus_pago: item.estatus_pago,
      ventas_contratos: {
        inventario: {
          num_unidad: item.num_unidad,
          id_proyecto: null // Not available in view
        }
      }
    })) || [];
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
      .select(`
        *,
        proyectos(nombre, id_desarrollador)
      `)
      .order('num_unidad', { ascending: true });
    
    if (error) throw error;
    return data as InventarioRecord[];
  },

  async getInventarioByProject(proyectoId: number) {
    const { data, error } = await supabase
      .from('inventario')
      .select(`
        *,
        proyectos(nombre, id_desarrollador)
      `)
      .eq('id_proyecto', proyectoId)
      .order('num_unidad', { ascending: true });
    
    if (error) throw error;
    return data as InventarioRecord[];
  },

  async getInventarioByDesarrollador(desarrolladorId: number) {
    const { data, error } = await supabase
      .from('inventario')
      .select(`
        *,
        proyectos!inner(nombre, id_desarrollador)
      `)
      .eq('proyectos.id_desarrollador', desarrolladorId)
      .order('num_unidad', { ascending: true });
    
    if (error) throw error;
    return data as InventarioRecord[];
  },

  async getInventarioByUnit(idInventario: number) {
    const { data, error } = await supabase
      .from('inventario')
      .select(`
        *,
        proyectos(nombre, id_desarrollador)
      `)
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

  async getProyectosByDesarrollador(desarrolladorId: number) {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .eq('id_desarrollador', desarrolladorId)
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

export const desarrolladorService = {
  async getDesarrolladores() {
    const { data, error } = await supabase
      .from('desarrollador')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data as DesarrolladorRecord[];
  },

  async getDesarrolladorById(id: number) {
    const { data, error } = await supabase
      .from('desarrollador')
      .select('*')
      .eq('id_desarrollador', id)
      .single();
    
    if (error) throw error;
    return data as DesarrolladorRecord;
  },

  // NEW: Get dashboard summary using corrected logic
  async getDashboardSummary(desarrolladorId: number, proyectoId?: number) {
    let query = supabase
      .from('vw_dashboard_remodela')
      .select('*');
    
    if (proyectoId) {
      query = query.eq('id_proyecto', proyectoId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // NEW: Get total cobranza with corrected calculation
  async getTotalCobranza(desarrolladorId: number, proyectoId?: number, fechaCorte?: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_total_cobranza_remodela', {
          fecha_corte: fechaCorte || new Date().toISOString().split('T')[0]
        });
      
      if (error) {
        console.error('Error fetching cobranza:', error);
        throw error;
      }
      
      console.log('Cobranza data received:', data); // Debug log
      
      // If specific project requested, filter the result
      if (proyectoId && data) {
        const projectData = await this.getDashboardSummary(desarrolladorId, proyectoId);
        return projectData?.[0]?.total_cobrado || 0;
      }
      
      return Number(data) || 0;
    } catch (error) {
      console.error('Error in getTotalCobranza:', error);
      return 0;
    }
  },

  // NEW: Get corrected sales value (excluding Rescindida)
  async getTotalVentasCorregido(desarrolladorId: number, proyectoId?: number) {
    try {
      let query = supabase
        .from('venta_cobranza_upload')
        .select('monto')
        .eq('categoria', 'Venta'); // Exclude Rescindida
      
      if (proyectoId) {
        query = query.eq('proyecto_id', proyectoId);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching ventas:', error);
        throw error;
      }
      
      console.log('Ventas data received:', data); // Debug log
      
      // Sum manually since Supabase aggregate functions can be tricky
      const total = data?.reduce((sum, item) => {
        const amount = Number(item.monto) || 0;
        return sum + amount;
      }, 0) || 0;
      
      console.log('Calculated total ventas:', total); // Debug log
      return total;
    } catch (error) {
      console.error('Error in getTotalVentasCorregido:', error);
      return 0;
    }
  },

  // NEW: Get project summaries with corrected values
  async getProyectosSummary(desarrolladorId: number) {
    try {
      const { data, error } = await supabase
        .from('vw_dashboard_remodela')
        .select('*');
      
      if (error) {
        console.error('Error fetching proyectos summary:', error);
        throw error;
      }
      
      console.log('Proyectos summary data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error in getProyectosSummary:', error);
      return [];
    }
  },

  // NEW: Get sales and payments filtered by project
  async getDeveloperDataByProject(desarrolladorId: number, proyectoId?: number) {
    try {
      const [dashboardData, ventasData, pagosData] = await Promise.all([
        this.getDashboardSummary(desarrolladorId, proyectoId),
        proyectoId ? ventasService.getVentasContratosByProject(proyectoId) : ventasService.getVentasContratosByDesarrollador(desarrolladorId),
        proyectoId ? ventasService.getPagosByProject(proyectoId) : ventasService.getPagosByDesarrollador(desarrolladorId)
      ]);
      
      console.log('Dashboard data for project:', dashboardData); // Debug log
      
      return {
        dashboardData,
        ventasData,
        pagosData
      };
    } catch (error) {
      console.error('Error loading developer data by project:', error);
      throw error;
    }
  }
};