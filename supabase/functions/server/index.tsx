import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Get all expenses for a user
app.get('/make-server-0e9abf6d/expenses/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const expenses = await kv.getByPrefix(`expenses:${userId}:`)
    
    return c.json({ 
      success: true, 
      expenses: expenses.map(exp => ({
        ...exp.value,
        id: exp.key.split(':')[2]
      }))
    })
  } catch (error) {
    console.log('Error fetching expenses:', error)
    return c.json({ success: false, error: 'Failed to fetch expenses' }, 500)
  }
})

// Add new expense
app.post('/make-server-0e9abf6d/expenses/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const expense = await c.req.json()
    const expenseId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    await kv.set(`expenses:${userId}:${expenseId}`, {
      ...expense,
      id: expenseId,
      userId,
      createdAt: new Date().toISOString()
    })
    
    return c.json({ success: true, id: expenseId })
  } catch (error) {
    console.log('Error adding expense:', error)
    return c.json({ success: false, error: 'Failed to add expense' }, 500)
  }
})

// Delete expense
app.delete('/make-server-0e9abf6d/expenses/:userId/:expenseId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const expenseId = c.req.param('expenseId')
    
    await kv.del(`expenses:${userId}:${expenseId}`)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting expense:', error)
    return c.json({ success: false, error: 'Failed to delete expense' }, 500)
  }
})

// Get salary data for a user
app.get('/make-server-0e9abf6d/salary/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const salaryData = await kv.get(`salary:${userId}`)
    
    return c.json({ 
      success: true, 
      salary: salaryData || { monthly: 50000, lastUpdated: null }
    })
  } catch (error) {
    console.log('Error fetching salary:', error)
    return c.json({ success: false, error: 'Failed to fetch salary' }, 500)
  }
})

// Update salary
app.post('/make-server-0e9abf6d/salary/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const salaryData = await c.req.json()
    
    await kv.set(`salary:${userId}`, {
      ...salaryData,
      lastUpdated: new Date().toISOString()
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error updating salary:', error)
    return c.json({ success: false, error: 'Failed to update salary' }, 500)
  }
})

// Get savings data for a user
app.get('/make-server-0e9abf6d/savings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const savingsData = await kv.get(`savings:${userId}`)
    
    return c.json({ 
      success: true, 
      savings: savingsData || { goal: 100000, current: 0, lastUpdated: null }
    })
  } catch (error) {
    console.log('Error fetching savings:', error)
    return c.json({ success: false, error: 'Failed to fetch savings' }, 500)
  }
})

// Update savings
app.post('/make-server-0e9abf6d/savings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const savingsData = await c.req.json()
    
    await kv.set(`savings:${userId}`, {
      ...savingsData,
      lastUpdated: new Date().toISOString()
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error updating savings:', error)
    return c.json({ success: false, error: 'Failed to update savings' }, 500)
  }
})

// Health check
app.get('/make-server-0e9abf6d/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

Deno.serve(app.fetch)