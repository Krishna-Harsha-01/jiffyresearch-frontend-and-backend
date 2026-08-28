const { validateEmailDeliverability } = require('./services/email.service');

async function testEmailValidation() {
  console.log('=== TESTING EMAIL VALIDATION & DELIVERABILITY ===\n');

  // Test 1: Real Gmail Domain
  console.log('Test 1: Real Gmail Address (test@gmail.com)');
  const res1 = await validateEmailDeliverability('test@gmail.com');
  console.log('Result:', res1);
  console.log(res1.valid === true ? '✅ PASSED' : '❌ FAILED');

  // Test 2: Fake Non-Existent Domain
  console.log('\nTest 2: Fake Non-Existent Domain (user@nonexistentfakedomain99999.com)');
  const res2 = await validateEmailDeliverability('user@nonexistentfakedomain99999.com');
  console.log('Result:', res2);
  console.log(res2.valid === false ? '✅ PASSED' : '❌ FAILED');

  // Test 3: Disposable Email Provider
  console.log('\nTest 3: Disposable Email Address (test@mailinator.com)');
  const res3 = await validateEmailDeliverability('test@mailinator.com');
  console.log('Result:', res3);
  console.log(res3.valid === false ? '✅ PASSED' : '❌ FAILED');

  console.log('\n=== ALL EMAIL VALIDATION TESTS COMPLETE ===');
  process.exit(0);
}

testEmailValidation().catch(console.error);
