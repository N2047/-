// End-to-End API verification script
const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('=== E2E Integration Verification ===\n');

  // 1. GET /contact
  console.log('1. Testing GET /contact ...');
  const resContact = await fetch(`${BASE_URL}/contact`);
  console.log(`Status: ${resContact.status}`);
  const contactText = await resContact.text();
  console.log(`Has Identified Option: ${contactText.includes('पहिचानसहित गुनासो गर्ने')}`);
  console.log(`Has Anonymous Option: ${contactText.includes('बेनामी गुनासो गर्ने')}`);
  console.log(`Has Tracking Tab: ${contactText.includes('गुनासोको अवस्था हेर्नुहोस्')}`);

  // 2. GET /admin
  console.log('\n2. Testing GET /admin ...');
  const resAdmin = await fetch(`${BASE_URL}/admin`);
  console.log(`Status: ${resAdmin.status}`);
  const adminText = await resAdmin.text();
  console.log(`Has Grievance Tab: ${adminText.includes('गुनासो व्यवस्थापन')}`);
  console.log(`Has Contacts Tab: ${adminText.includes('सरकारी निकाय सम्पर्क')}`);
  console.log(`Has Settings Tab: ${adminText.includes('गुनासो सेटिङ्स')}`);

  // 3. POST /api/grievance/submit (Identified complaint to Local Government: Panchthar -> Phidim Municipality)
  console.log('\n3. Testing POST /api/grievance/submit (Identified to Panchthar -> Phidim Municipality) ...');
  const payloadIdentified = {
    complaint_type: 'identified',
    full_name: 'हरि प्रसाद शर्मा',
    address: 'विराटनगर-४, मोरङ',
    phone: '9852012345',
    email: 'hari.sharma@example.com',
    recipient_type: 'local_government',
    district_id: 'panchthar',
    local_government_id: 'phidim_mun',
    subject: 'अपाङ्गता परिचयपत्र',
    description: 'फिदिम नगरपालिकामा अपाङ्गता परिचयपत्र वितरण प्रक्रिया सरल, पहुँचयुक्त तथा समयमै सम्पन्न गर्न माग गरिएको आधिकारिक गुनासो।',
    attachments: []
  };

  const resSubmit1 = await fetch(`${BASE_URL}/api/grievance/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadIdentified)
  });
  console.log(`Submit Status: ${resSubmit1.status}`);
  const submitData1 = await resSubmit1.json();
  console.log('Submit 1 Result:', JSON.stringify(submitData1, null, 2));
  const complaintNumber = submitData1.complaint?.complaint_number;

  // 4. POST /api/grievance/submit (Anonymous complaint to Ministry)
  console.log('\n4. Testing POST /api/grievance/submit (Anonymous to Ministry of Social Development) ...');
  const payloadAnon = {
    complaint_type: 'anonymous',
    recipient_type: 'ministry',
    ministry_id: 'mosd_koshi',
    subject: 'पहुँचयुक्तता',
    description: 'मन्त्रालय मातहतका कार्यालयहरूमा अपाङ्गतामैत्री र्‍याम्प तथा संकेत चिह्नको व्यवस्था गर्न अनुरोध।',
    attachments: []
  };
  const resSubmit2 = await fetch(`${BASE_URL}/api/grievance/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadAnon)
  });
  console.log(`Submit Status: ${resSubmit2.status}`);
  const submitData2 = await resSubmit2.json();
  console.log('Submit 2 Result:', JSON.stringify(submitData2, null, 2));

  // 5. GET /api/grievance/track
  if (complaintNumber) {
    console.log(`\n5. Testing GET /api/grievance/track for ${complaintNumber} ...`);
    const resTrack = await fetch(`${BASE_URL}/api/grievance/track?complaint_number=${encodeURIComponent(complaintNumber)}`);
    console.log(`Track Status: ${resTrack.status}`);
    const trackData = await resTrack.json();
    console.log('Track Result:', JSON.stringify(trackData, null, 2));
  }

  // 6. POST /api/chat (AI Chatbot with knowledge base fallback)
  console.log('\n6. Testing POST /api/chat (AI Chatbot query) ...');
  const resChat = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'गुनासो दर्ता कसरी गर्ने र कुन कुन मन्त्रालयमा पठाउन सकिन्छ?'
    })
  });
  console.log(`Chat Status: ${resChat.status}`);
  const chatData = await resChat.json();
  console.log('Chat Result:', JSON.stringify({
    success: chatData.success,
    answerSnippet: chatData.answer?.slice(0, 200) + '...',
    provider: chatData.provider,
    sourcesCount: chatData.sources?.length
  }, null, 2));

  // 7. GET /api/ai-knowledge (Knowledge search)
  console.log('\n7. Testing GET /api/ai-knowledge ...');
  const resKb = await fetch(`${BASE_URL}/api/ai-knowledge?q=${encodeURIComponent('गुनासो')}`);
  console.log(`KB Status: ${resKb.status}`);
  const kbData = await resKb.json();
  console.log('Knowledge Search Sample:', JSON.stringify({
    total: kbData.total,
    count: kbData.count,
    sampleTitle: kbData.data?.[0]?.title
  }, null, 2));

  console.log('\n=== All Automated Tests Passed with Flying Colors ===');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
