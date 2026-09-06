async function verify() {
  try {
    const res = await fetch('http://localhost:3001');
    const html = await res.text();
    
    console.log('--- BRANDING TITLE CHECK ---');
    console.log('Has text-red-600 on branding title:', html.includes('text-red-600 dark:text-red-400'));
    console.log('Has अपाङ्गता सूचना केन्द्र:', html.includes('अपाङ्गता सूचना केन्द्र'));
    console.log('Has black/dark text on subtitle:', html.includes('text-slate-800 dark:text-slate-200'));

    console.log('--- NAVBAR CHECK ---');
    const navMatch = html.match(/<nav aria-label="मुख्य नेभिगेसन"[\s\S]*?<\/nav>/);
    if (navMatch) {
      const navHtml = navMatch[0];
      const hasDuplicateAdmin = navHtml.includes('/admin');
      const hasShieldCheck = navHtml.includes('ShieldCheck');
      const hasCitizenBadge = navHtml.includes('नागरिक');
      console.log('Navbar has redundant admin link:', hasDuplicateAdmin);
      console.log('Navbar has ShieldCheck icon:', hasShieldCheck);
      console.log('Navbar has user badge (नागरिक):', hasCitizenBadge);
      console.log('Navbar has clean login/register button:', navHtml.includes('🔐 लगइन / दर्ता'));
    } else {
      console.log('Navbar not found!');
    }

    console.log('--- TOP BAR AUTH CHECK ---');
    const topBarMatch = html.match(/<aside aria-label="Accessibility and security controls"[\s\S]*?<\/aside>/);
    if (topBarMatch) {
      console.log('Top bar is present and handles auth/accessibility');
    }
  } catch (err) {
    console.error('Error verifying:', err);
  }
}

verify();
