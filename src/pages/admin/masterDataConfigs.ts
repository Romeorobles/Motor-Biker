import { z } from 'zod'

export interface FieldConfig {
  name: string
  label: string
  type?: 'text' | 'email' | 'checkbox'
}

export interface ColumnConfig {
  key: string
  label: string
}

export interface EntityConfig {
  title: string
  path: string
  updateMethod: 'PUT' | 'PATCH'
  columns: ColumnConfig[]
  fields: FieldConfig[]
  schema: z.ZodTypeAny
  searchField: string
}

const marcasSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  pais: z.string().min(1, 'El país es obligatorio'),
})

const nombreDescripcionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
})

const coloresSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  codigo_hex: z.string().optional(),
  descripcion: z.string().optional(),
})

const proveedoresSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  pais: z.string().min(1, 'El país es obligatorio'),
  contacto: z.string().min(1, 'El contacto es obligatorio'),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

export const masterDataConfigs: Record<string, EntityConfig> = {
  marcas: {
    title: 'Marcas',
    path: '/marcas',
    updateMethod: 'PUT',
    searchField: 'nombre',
    columns: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'pais', label: 'País' },
    ],
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'pais', label: 'País' },
    ],
    schema: marcasSchema,
  },
  categorias: {
    title: 'Categorías',
    path: '/categorias',
    updateMethod: 'PUT',
    searchField: 'nombre',
    columns: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' },
    ],
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'descripcion', label: 'Descripción' },
    ],
    schema: nombreDescripcionSchema,
  },
  'tipo-motor': {
    title: 'Tipo de Motor',
    path: '/tipo-motor',
    updateMethod: 'PUT',
    searchField: 'nombre',
    columns: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' },
    ],
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'descripcion', label: 'Descripción' },
    ],
    schema: nombreDescripcionSchema,
  },
  'estado-moto': {
    title: 'Estado de Moto',
    path: '/estado-moto',
    updateMethod: 'PUT',
    searchField: 'nombre',
    columns: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' },
    ],
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'descripcion', label: 'Descripción' },
    ],
    schema: nombreDescripcionSchema,
  },
  colores: {
    title: 'Colores',
    path: '/colores',
    updateMethod: 'PATCH',
    searchField: 'nombre',
    columns: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'codigo_hex', label: 'Código Hex' },
      { key: 'descripcion', label: 'Descripción' },
    ],
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'codigo_hex', label: 'Código Hex (ej: #FF0000)' },
      { name: 'descripcion', label: 'Descripción' },
    ],
    schema: coloresSchema,
  },
  proveedores: {
    title: 'Proveedores',
    path: '/proveedores',
    updateMethod: 'PATCH',
    searchField: 'nombre',
    columns: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'pais', label: 'País' },
      { key: 'contacto', label: 'Contacto' },
      { key: 'email', label: 'Email' },
    ],
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'pais', label: 'País' },
      { name: 'contacto', label: 'Contacto' },
      { name: 'telefono', label: 'Teléfono' },
      { name: 'email', label: 'Email', type: 'email' },
    ],
    schema: proveedoresSchema,
  },
}
