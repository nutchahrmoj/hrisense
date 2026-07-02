const fs = require('node:fs')
const { Client } = require('pg')
const { createClient } = require('@supabase/supabase-js')

function readEnv(path) {
  if (!fs.existsSync(path)) return {}

  const values = {}
  const content = fs.readFileSync(path, 'utf8')

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const index = line.indexOf('=')
    if (index === -1) continue

    const key = line.slice(0, index).trim()
    let value = line.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }

  return values
}

function sanitizeError(error) {
  return {
    message: error.message,
    code: error.code ?? null,
  }
}

function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split('.')[0]
  } catch {
    return null
  }
}

async function verifyRest(env) {
  const url = process.env.COMPARE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.COMPARE_SUPABASE_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.service_role_secret ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return { ok: false, error: 'Missing Supabase REST URL or key' }
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  })

  const { data: dashboard, error: dashboardError } = await supabase
    .from('v_org_dashboard')
    .select('organization_id,name_th,org_level,total_personnel,total_quota,vacancy_count,computed_at')

  if (dashboardError) {
    return { ok: false, error: dashboardError.message }
  }

  const total = dashboard.reduce(
    (acc, row) => ({
      personnel: acc.personnel + (row.total_personnel || 0),
      quota: acc.quota + (row.total_quota || 0),
      vacancy: acc.vacancy + (row.vacancy_count || 0),
    }),
    { personnel: 0, quota: 0, vacancy: 0 },
  )

  const divisions = dashboard
    .filter((row) => row.org_level === 'division')
    .reduce(
      (acc, row) => ({
        personnel: acc.personnel + (row.total_personnel || 0),
        quota: acc.quota + (row.total_quota || 0),
        vacancy: acc.vacancy + (row.vacancy_count || 0),
      }),
      { personnel: 0, quota: 0, vacancy: 0 },
    )

  const latestComputedAt = [...new Set(dashboard.map((row) => row.computed_at))]
    .filter(Boolean)
    .sort()
    .pop()

  const { count: activeWithBurnout, error: burnoutError } = await supabase
    .from('v_personnel_overview')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .not('burnout_risk', 'is', null)

  if (burnoutError) {
    return { ok: false, error: burnoutError.message }
  }

  const { count: activePersonnel, error: activeError } = await supabase
    .from('v_personnel_overview')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  if (activeError) {
    return { ok: false, error: activeError.message }
  }

  return {
    ok: true,
    endpoint: new URL(url).origin,
    dashboardRows: dashboard.length,
    total,
    divisions,
    latestComputedAt,
    activePersonnel,
    activeWithBurnout,
  }
}

async function verifyCron(env) {
  const supabaseUrl = process.env.COMPARE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const projectRef = projectRefFromUrl(supabaseUrl)
  const password = process.env.PGPASSWORD || env.DB_PASSWORD || env.password
  const username = process.env.PGUSER || env.username || 'postgres'

  if (!projectRef || !password) {
    return { ok: false, error: 'Missing project ref or DB password for cron SQL check' }
  }

  const attempts = [
    {
      label: 'direct',
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      user: 'postgres',
    },
    {
      label: 'pooler',
      host: 'aws-0-ap-northeast-1.pooler.supabase.com',
      port: 6543,
      user: username,
    },
    {
      label: 'pooler-project-user',
      host: 'aws-0-ap-northeast-1.pooler.supabase.com',
      port: 6543,
      user: `postgres.${projectRef}`,
    },
  ]

  const errors = []

  for (const attempt of attempts) {
    const client = new Client({
      host: attempt.host,
      port: attempt.port,
      database: 'postgres',
      user: attempt.user,
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    })

    try {
      await client.connect()
      const job = await client.query(`
        select jobid, schedule, command, active
        from cron.job
        where jobname = 'refresh-org-risk-snapshots'
      `)
      const runs = await client.query(`
        select status, start_time, end_time, return_message
        from cron.job_run_details
        where jobid in (
          select jobid from cron.job
          where jobname = 'refresh-org-risk-snapshots'
        )
        order by start_time desc
        limit 5
      `)

      return {
        ok: true,
        via: attempt.label,
        job: job.rows,
        recentRuns: runs.rows,
      }
    } catch (error) {
      errors.push({
        via: attempt.label,
        error: sanitizeError(error),
      })
    } finally {
      try {
        await client.end()
      } catch {}
    }
  }

  return { ok: false, errors }
}

async function main() {
  const env = {
    ...readEnv('.env.local'),
    ...readEnv('secrets/secret-keys.txt'),
  }

  const rest = await verifyRest(env)
  const cron = await verifyCron(env)

  console.log(JSON.stringify({ rest, cron }, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
