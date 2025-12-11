import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Vérifier que l'utilisateur est authentifié et a les droits
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  // Vérifier que l'utilisateur connecté est admin ou superadmin
  const supabase = serverSupabaseServiceRole(event) as any

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUserProfile || !['admin', 'superadmin'].includes(currentUserProfile.role)) {
    throw createError({
      statusCode: 403,
      message: 'Accès refusé. Seuls les administrateurs peuvent créer des comptes admin.'
    })
  }

  // Lire les données du body
  const body = await readBody(event)

  const { email, first_name, last_name, phone, role, avatar_url } = body

  if (!email || !first_name || !last_name) {
    throw createError({
      statusCode: 400,
      message: 'Email, prénom et nom sont requis'
    })
  }

  try {
    // Créer l'utilisateur dans auth avec le service role client
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
      }
    })

    if (authError) {
      throw createError({
        statusCode: 400,
        message: authError.message
      })
    }

    // Vérifier si le profil existe déjà
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle()

    let profileData

    if (existingProfile) {
      // Mettre à jour le profil existant
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name,
          last_name,
          phone: phone || null,
          role: role || 'admin',
          avatar_url: avatar_url || null
        })
        .eq('id', authData.user.id)
        .select()
        .single()

      if (updateError) {
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw createError({
          statusCode: 400,
          message: updateError.message
        })
      }
      profileData = data
    } else {
      // Créer un nouveau profil
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name,
          last_name,
          phone: phone || null,
          role: role || 'admin',
          avatar_url: avatar_url || null
        })
        .select()
        .single()

      if (insertError) {
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw createError({
          statusCode: 400,
          message: insertError.message
        })
      }
      profileData = data
    }

    return {
      success: true,
      data: profileData
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de la création de l\'administrateur'
    })
  }
})
