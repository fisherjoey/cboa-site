'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('Testing connection...')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('🔍 Testing Supabase connection...')

        // Test 1: Check if client is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
          setError('❌ NEXT_PUBLIC_SUPABASE_URL not set')
          return
        }

        setStatus('✅ Environment variables loaded')
        console.log('✅ Environment variables loaded')

        // Test 2: Try to fetch from rule_modifications table
        console.log('🔄 Fetching from rule_modifications table...')
        const { data: rules, error: fetchError } = await supabase
          .from('rule_modifications')
          .select('*')
          .limit(5)

        console.log('📊 Query result:', { data: rules, error: fetchError })

        if (fetchError) {
          console.error('❌ Database error:', fetchError)
          setError(`❌ Database error: ${fetchError.message}`)
          return
        }

        console.log('✅ Successfully fetched data!')
        setStatus('✅ Successfully connected to Supabase!')
        setData(rules)

      } catch (err: any) {
        console.error('❌ Exception:', err)
        setError(`❌ Exception: ${err.message}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          🧪 Supabase Connection Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg mb-2">{status}</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
              {error}
            </div>
          )}
        </div>

        {data && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Data from Supabase ({data.length} rules)
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold mb-2">🔍 Environment Check:</h3>
          <ul className="space-y-1 text-sm">
            <li>
              URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </li>
            <li>
              Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </li>
            <li>
              Use Supabase: {process.env.NEXT_PUBLIC_USE_SUPABASE || 'Not set (defaults to false)'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
