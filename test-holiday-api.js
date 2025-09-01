// Test script for holiday management API
// Run this in the browser console or use a tool like Postman

// Test 1: Get all holidays
async function testGetHolidays() {
  try {
    const response = await fetch('/api/holiday');
    const data = await response.json();
    console.log('GET /api/holiday:', data);
    return data;
  } catch (error) {
    console.error('Error fetching holidays:', error);
  }
}

// Test 2: Create a holiday
async function testCreateHoliday() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const response = await fetch('/api/holiday', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromDate: tomorrow.toISOString(),
        toDate: dayAfterTomorrow.toISOString(),
        description: 'Test holiday for API testing',
      }),
    });

    const data = await response.json();
    console.log('POST /api/holiday:', data);
    return data;
  } catch (error) {
    console.error('Error creating holiday:', error);
  }
}

// Test 2b: Create a single-day holiday
async function testCreateSingleDayHoliday() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await fetch('/api/holiday', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromDate: tomorrow.toISOString(),
        toDate: tomorrow.toISOString(),
        description: 'Test single-day holiday',
      }),
    });

    const data = await response.json();
    console.log('POST /api/holiday (single-day):', data);
    return data;
  } catch (error) {
    console.error('Error creating single-day holiday:', error);
  }
}

// Test 3: Delete a holiday
async function testDeleteHoliday(holidayId) {
  try {
    const response = await fetch(`/api/holiday/${holidayId}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    console.log('DELETE /api/holiday:', data);
    return data;
  } catch (error) {
    console.error('Error deleting holiday:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('=== Holiday Management API Tests ===');

  // Test 1: Get holidays
  console.log('\n1. Testing GET /api/holiday...');
  await testGetHolidays();

  // Test 2: Create holiday
  console.log('\n2. Testing POST /api/holiday...');
  const createResult = await testCreateHoliday();

  // Test 2b: Create single-day holiday
  console.log('\n2b. Testing POST /api/holiday (single-day)...');
  const singleDayResult = await testCreateSingleDayHoliday();

  // Test 3: Get holidays again to see the new ones
  console.log('\n3. Testing GET /api/holiday again...');
  const holidays = await testGetHolidays();

  // Test 4: Delete the holidays if they were created
  if (createResult?.ok && createResult?.data?._id) {
    console.log('\n4. Testing DELETE /api/holiday...');
    await testDeleteHoliday(createResult.data._id);
  }

  if (singleDayResult?.ok && singleDayResult?.data?._id) {
    console.log('\n4b. Testing DELETE /api/holiday (single-day)...');
    await testDeleteHoliday(singleDayResult.data._id);
  }

  console.log('\n=== Tests completed ===');
}

// Export functions for manual testing
window.holidayTests = {
  testGetHolidays,
  testCreateHoliday,
  testCreateSingleDayHoliday,
  testDeleteHoliday,
  runTests,
};
