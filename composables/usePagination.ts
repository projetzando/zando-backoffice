import { PAGINATION } from '~/utils/constants'

/**
 * Interface pour les options de pagination
 */
export interface PaginationOptions {
  page?: number
  pageSize?: number
  orderBy?: string
  ascending?: boolean
}

/**
 * Interface pour les résultats paginés
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Composable pour la pagination serveur avec Supabase
 */
export function usePagination() {
  const supabase = useSupabaseClient()

  /**
   * Récupère des données paginées depuis Supabase
   * @param table Nom de la table
   * @param options Options de pagination
   * @param selectQuery Query select (ex: '*, seller:sellers(name)')
   * @param filters Fonction pour ajouter des filtres additionnels
   */
  async function fetchPaginated<T>(
    table: string,
    options: PaginationOptions = {},
    selectQuery: string = '*',
    filters?: (query: any) => any,
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
      orderBy = 'created_at',
      ascending = false,
    } = options

    // Calculer l'offset
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Construire la requête de base
    let query = supabase.from(table).select(selectQuery, { count: 'exact' })

    // Appliquer les filtres additionnels si fournis
    if (filters) {
      query = filters(query)
    }

    // Appliquer l'ordre et la pagination
    query = query.order(orderBy, { ascending }).range(from, to)

    // Exécuter la requête
    const { data, error, count } = await query

    if (error) {
      console.error(`Erreur pagination ${table}:`, error)
      throw error
    }

    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    return {
      data: (data || []) as T[],
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  }

  /**
   * Calcule les informations de pagination pour l'UI
   */
  function calculatePaginationInfo(total: number, page: number, pageSize: number) {
    const totalPages = Math.ceil(total / pageSize)
    const from = (page - 1) * pageSize + 1
    const to = Math.min(page * pageSize, total)

    return {
      from,
      to,
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  }

  /**
   * Génère un tableau de numéros de pages pour la pagination
   * @param currentPage Page actuelle
   * @param totalPages Nombre total de pages
   * @param maxVisible Nombre maximum de pages visibles (par défaut: 5)
   */
  function generatePageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5,
  ): (number | string)[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisible / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    // Ajuster si on est proche du début ou de la fin
    if (currentPage <= halfVisible) {
      endPage = maxVisible
    }
    if (currentPage >= totalPages - halfVisible) {
      startPage = totalPages - maxVisible + 1
    }

    // Ajouter la première page et ellipse si nécessaire
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('...')
      }
    }

    // Ajouter les pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Ajouter ellipse et dernière page si nécessaire
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  return {
    fetchPaginated,
    calculatePaginationInfo,
    generatePageNumbers,
  }
}
