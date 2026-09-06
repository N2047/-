async function test() {
  const res = await fetch('http://localhost:3001');
  const html = await res.text();
  const start = html.indexOf('role="menubar"');
  const end = html.indexOf('</ul>', start);
  const menubar = html.substring(start, end);

  console.log('--- MENUBAR INSPECTION ---');
  console.log('Menubar contains पहुँचयुक्तता (Must be false):', menubar.includes('पहुँचयुक्तता'));
  console.log('Menubar contains गृहपृष्ठ:', menubar.includes('गृहपृष्ठ'));
  console.log('Menubar contains हाम्रो बारेमा:', menubar.includes('हाम्रो बारेमा'));
  console.log('Menubar contains विद्यमान कानुनको दस्तावेज:', menubar.includes('विद्यमान कानुनको दस्तावेज'));
  console.log('Menubar contains प्रतिवेदन:', menubar.includes('प्रतिवेदन'));
  console.log('Menubar contains १. पालिका प्रतिवेदन:', menubar.includes('१. पालिका प्रतिवेदन'));
  console.log('Menubar contains २. समग्र प्रतिवेदन:', menubar.includes('२. समग्र प्रतिवेदन'));
  console.log('Menubar contains सूचना/समाचार:', menubar.includes('सूचना/समाचार'));
  console.log('Menubar contains सम्पर्क:', menubar.includes('सम्पर्क'));
  console.log('Menubar contains खोजी:', menubar.includes('खोजी'));
  console.log('\n--- TOP BAR & AUTH INSPECTION ---');
  console.log('Top bar contains पहुँचयुक्तता (Must be true):', html.includes('पहुँचयुक्तता'));
  console.log('Contains लगइन / दर्ता:', html.includes('लगइन / दर्ता'));
}

test().catch(console.error);
