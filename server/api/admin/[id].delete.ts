import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Vérifier que l'utilisateur est authentifié et a les droits
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié',
    })
  }

  // Vérifier que l'utilisateur connecté est admin ou superadmin
  const supabase = serverSupabaseServiceRole(event)

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUserProfile || !['admin', 'superadmin'].includes(currentUserProfile.role)) {
    throw createError({
      statusCode: 403,
      message: 'Accès refusé. Seuls les administrateurs peuvent supprimer des comptes admin.',
    })
  }

  // Récupérer l'ID depuis les paramètres
  const adminId = getRouterParam(event, 'id')

  if (!adminId) {
    throw createError({
      statusCode: 400,
      message: 'ID administrateur requis',
    })
  }

  // Empêcher un admin de se supprimer lui-même
  if (adminId === user.id) {
    throw createError({
      statusCode: 400,
      message: 'Vous ne pouvez pas supprimer votre propre compte',
    })
  }

  try {
    // Supprimer l'utilisateur de auth (cascade supprime aussi le profil)
    const { error: authError } = await supabase.auth.admin.deleteUser(adminId)

    if (authError) {
      throw createError({
        statusCode: 400,
        message: authError.message,
      })
    }

    return {
      success: true,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de la suppression de l\'administrateur',
    })
  }
})
