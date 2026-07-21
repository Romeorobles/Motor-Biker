import { axiosClient } from '../api/axiosClient'

export interface Paginated<T> {
  items: T[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  searchField?: string
  sort?: string
  order?: 'ASC' | 'DESC'
}

export async function fetchPaginated<T>(path: string, params: ListParams = {}): Promise<Paginated<T>> {
  const res = await axiosClient.get(path, { params })
  return res.data.data as Paginated<T>
}

export async function fetchAllPages<T>(path: string, limit = 100): Promise<T[]> {
  const first = await fetchPaginated<T>(path, { page: 1, limit })
  return first.items
}

export async function createItem<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosClient.post(path, body)
  return res.data.data as T
}

export async function updateItem<T>(path: string, id: string, body: unknown, method: 'PUT' | 'PATCH' = 'PUT'): Promise<T> {
  const res = await axiosClient.request({ url: `${path}/${id}`, method, data: body })
  return res.data.data as T
}

export async function deleteItem(path: string, id: string): Promise<void> {
  await axiosClient.delete(`${path}/${id}`)
}
