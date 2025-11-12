// Test Netlify Functions directly without Netlify Dev
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

async function testResourcesFunction() {
  console.log('🧪 Testing resources function...\n')

  try {
    // Import the function handler
    const { handler } = await import('../netlify/functions/resources')

    // Mock the event object (simulating a GET request)
    const mockEvent = {
      httpMethod: 'GET',
      headers: {},
      body: null,
      queryStringParameters: {},
      path: '/.netlify/functions/resources',
      isBase64Encoded: false
    }

    // Mock context
    const mockContext = {
      callbackWaitsForEmptyEventLoop: true,
      functionName: 'resources',
      functionVersion: '1',
      invokedFunctionArn: '',
      memoryLimitInMB: '1024',
      awsRequestId: 'test-request-id',
      logGroupName: '',
      logStreamName: '',
      getRemainingTimeInMillis: () => 30000,
      done: () => {},
      fail: () => {},
      succeed: () => {}
    }

    console.log('📤 Calling handler...')
    const response = await handler(mockEvent as any, mockContext as any)

    console.log('\n✅ Response:')
    console.log('Status:', response.statusCode)
    console.log('Headers:', JSON.stringify(response.headers, null, 2))

    if (response.body) {
      try {
        const body = JSON.parse(response.body)
        console.log('Body:', JSON.stringify(body, null, 2))
      } catch {
        console.log('Body (raw):', response.body)
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
  }
}

testResourcesFunction()
