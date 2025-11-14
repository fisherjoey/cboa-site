// Simple script to test the public content API endpoints
// Run with: node scripts/test-api.js
// Make sure Netlify Dev is running first: npm run dev:netlify

const API_BASE = 'http://localhost:8888/.netlify/functions'

async function testEndpoint(name, url, method = 'GET', body = null) {
  console.log(`\n🔍 Testing ${name}...`)
  console.log(`   ${method} ${url}`)

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (response.ok) {
      console.log(`   ✅ Success (${response.status})`)
      console.log(`   Data:`, JSON.stringify(data, null, 2).substring(0, 200))
      return data
    } else {
      console.log(`   ❌ Failed (${response.status})`)
      console.log(`   Error:`, data)
      return null
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return null
  }
}

async function runTests() {
  console.log('🚀 Testing Public Content API Endpoints')
  console.log('========================================')

  // Test 1: Get all news (should be empty initially)
  await testEndpoint('GET public-news', `${API_BASE}/public-news`)

  // Test 2: Get all training events (should be empty)
  await testEndpoint('GET public-training', `${API_BASE}/public-training`)

  // Test 3: Get all resources (should be empty)
  await testEndpoint('GET public-resources', `${API_BASE}/public-resources`)

  // Test 4: Get all pages (should have 2 seeded pages: home and about)
  const pages = await testEndpoint('GET public-pages', `${API_BASE}/public-pages`)

  if (pages && pages.length > 0) {
    console.log(`\n📄 Found ${pages.length} pages:`)
    pages.forEach(page => {
      console.log(`   - ${page.page_name}: ${page.title}`)
    })
  }

  // Test 5: Get home page specifically
  await testEndpoint('GET home page', `${API_BASE}/public-pages?page_name=home`)

  // Test 6: Get all officials (should be empty)
  await testEndpoint('GET officials', `${API_BASE}/officials`)

  // Test 7: Create a test news article
  console.log('\n📝 Testing CREATE operation...')
  const testArticle = {
    title: 'Test News Article',
    slug: 'test-news-article',
    published_date: new Date().toISOString(),
    author: 'Test Author',
    excerpt: 'This is a test article',
    body: '<p>This is the test article body</p>',
    featured: false,
    tags: ['test'],
    active: true,
    priority: 0
  }

  const created = await testEndpoint(
    'CREATE news article',
    `${API_BASE}/public-news`,
    'POST',
    testArticle
  )

  if (created) {
    console.log(`\n✅ Created article with ID: ${created.id}`)

    // Test 8: Get the article we just created
    await testEndpoint('GET created article', `${API_BASE}/public-news?slug=test-news-article`)

    // Test 9: Update the article
    const updated = await testEndpoint(
      'UPDATE news article',
      `${API_BASE}/public-news`,
      'PUT',
      { id: created.id, title: 'Updated Test Article' }
    )

    if (updated) {
      console.log(`\n✅ Updated article title to: ${updated.title}`)
    }

    // Test 10: Delete the article
    await testEndpoint(
      'DELETE news article',
      `${API_BASE}/public-news?id=${created.id}`,
      'DELETE'
    )

    console.log('\n🧹 Cleanup: Test article deleted')
  }

  console.log('\n========================================')
  console.log('✨ All tests complete!')
  console.log('\nNext steps:')
  console.log('1. Check that the home and about pages are in your database')
  console.log('2. Try creating content through the API')
  console.log('3. Build the admin UI to make it easier!')
}

runTests().catch(console.error)
