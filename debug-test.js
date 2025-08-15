// Quick test to debug the payment data issue
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rbjdekamtxevjchhrsux.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiamRla2FtdHhldmpjaGhyc3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyMTksImV4cCI6MjA2ODY2OTIxOX0.O_84bIaqP0zG3Oncff5b50YjuPB466Ixbsolhru9dOQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPaymentData() {
  try {
    console.log('Testing getPagosByProject for Cassia (project ID 4)');
    
    // Step 1: Get project name
    const { data: proyecto, error: proyectoError } = await supabase
      .from('proyectos')
      .select('nombre')
      .eq('id_proyecto', 4)
      .single();
    
    if (proyectoError) throw proyectoError;
    console.log('Project found:', proyecto);
    
    // Step 2: Get payments from view (with range to get more than 1000)
    const { data, error } = await supabase
      .from('vw_historial_pagos')
      .select('*')
      .eq('proyecto_nombre', proyecto.nombre)
      .order('fecha_pago', { ascending: false })
      .range(0, 1999); // Get first 2000 records
    
    if (error) throw error;
    
    console.log('Total payments found:', data?.length);
    
    // Filter Alberto's payments
    const albertoPayments = data?.filter(item => item.nombre_cliente === 'Alberto del Río Ruiz');
    console.log('Alberto payments found:', albertoPayments?.length);
    console.log('Alberto payments details:', albertoPayments);
    
    // Transform data as the function does
    const transformedData = data?.map(item => ({
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
          correo: null
        },
        inventario: {
          num_unidad: item.num_unidad,
          id_proyecto: 4
        }
      }
    })) || [];
    
    const transformedAlberto = transformedData.filter(p => p.ventas_contratos?.clientes?.nombre_cliente === 'Alberto del Río Ruiz');
    console.log('Transformed Alberto payments:', transformedAlberto?.length);
    console.log('Transformed Alberto details:', transformedAlberto);
    
  } catch (error) {
    console.error('Error testing payment data:', error);
  }
}

testPaymentData();