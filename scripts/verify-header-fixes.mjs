async function verify() {
  try {
    const res = await fetch('http://localhost:3001');
    const html = await res.text();
    
    console.log('--- LOGOS CHECK ---');
    console.log('Has Nepal Emblem (/images/emblem-nepal.svg):', html.includes('/images/emblem-nepal.svg'));
    console.log('Has NFD-N Logo (/images/nfdn-logo.png):', html.includes('/images/nfdn-logo.png'));
    console.log('Has Red DIC Title (text-red-600):', html.includes('text-red-600 dark:text-red-400'));

    console.log('--- HERO ACTION BUTTONS CHECK ---');
    const hasLawsBtn = html.includes('कानुन हेर्नुहोस्');
    const hasPalikaReport = html.includes('१. पालिका प्रतिवेदन');
    const hasOverallReport = html.includes('२. समग्र प्रतिवेदन');
    const hasOldReportBtn = html.includes('रिपोर्ट हेर्नुहोस्');

    console.log('Has कानुन हेर्नुहोस्:', hasLawsBtn);
    console.log('Has १. पालिका प्रतिवेदन inside प्रतिवेदन:', hasPalikaReport);
    console.log('Has २. समग्र प्रतिवेदन inside प्रतिवेदन:', hasOverallReport);
    console.log('Has old रिपोर्ट हेर्नुहोस् (MUST BE FALSE):', hasOldReportBtn);

    console.log('--- ALL CHECKS FINISHED ---');
  } catch (err) {
    console.error('Error verifying:', err);
  }
}

verify();
