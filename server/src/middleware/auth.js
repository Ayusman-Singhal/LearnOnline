const { clerkClient } = require('@clerk/clerk-sdk-node')
const supabase = require('../lib/supabase')

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const token = authHeader.slice(7)
    const { sub: clerkId } = await clerkClient.verifyToken(token)

    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .maybeSingle()

    // Webhook may not be configured yet — auto-create user on first API call
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId)
      const email = clerkUser.emailAddresses?.[0]?.emailAddress
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
      const { data: created, error } = await supabase
        .from('users')
        .upsert({
          clerk_id: clerkId,
          email,
          name,
          avatar_url: clerkUser.imageUrl,
          role: 'student',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'clerk_id' })
        .select()
        .single()
      if (error || !created) return res.status(500).json({ error: 'Failed to create user' })
      user = created
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

module.exports = { requireAuth, requireRole }
