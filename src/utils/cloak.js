export const CLOAK_PROFILES = [
  {
    id: 'default',
    name: 'Normal Portal',
    title: 'UnblockHub - HTML5 Offline Web Portal',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
  },
  {
    id: 'docs',
    name: 'Google Docs',
    title: 'Untitled document - Google Docs',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zm3 13H8v-2h8v2zm0-4H8v-2h8v2z"/></svg>`
  },
  {
    id: 'drive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="8.5,3.5 15.5,3.5 22,14.5 15,14.5" fill="#facc15"/><polygon points="2,14.5 8.5,3.5 15.5,14.5 9,14.5" fill="#2563eb"/><polygon points="2,14.5 9,14.5 15.5,21.5 8.5,21.5" fill="#16a34a"/></svg>`
  },
  {
    id: 'classroom',
    name: 'Google Classroom',
    title: 'Classes - Google Classroom',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#15803d"><rect x="2" y="3" width="20" height="15" rx="2" fill="#15803d"/><circle cx="12" cy="9" r="2.5" fill="#ffffff"/><path d="M7 15c0-2.5 3-3 5-3s5 .5 5 3" fill="#ffffff"/><rect x="1" y="18" width="22" height="3" fill="#854d0e"/></svg>`
  },
  {
    id: 'canvas',
    name: 'Canvas LMS',
    title: 'Dashboard | Canvas',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e11d48"><circle cx="12" cy="12" r="10" fill="#e11d48"/><circle cx="12" cy="12" r="6" fill="#ffffff"/><circle cx="12" cy="12" r="2" fill="#e11d48"/></svg>`
  },
  {
    id: 'desmos',
    name: 'Desmos Calculator',
    title: 'Desmos | Graphing Calculator',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#059669"><rect width="24" height="24" rx="4" fill="#059669"/><path d="M4 18c4-1 6-12 8-12s4 11 8 12" stroke="#ffffff" stroke-width="2.5" fill="none"/></svg>`
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    title: 'Cellular respiration - Wikipedia',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0f172a"><rect width="24" height="24" rx="4" fill="#ffffff"/><text x="12" y="17" font-family="serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#000000">W</text></svg>`
  }
];

export function applyCloak(profileId, customTitle) {
  const profile = CLOAK_PROFILES.find(p => p.id === profileId) || CLOAK_PROFILES[0];
  const titleToSet = customTitle && customTitle.trim() ? customTitle : profile.title;
  
  document.title = titleToSet;

  // Change favicon
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(profile.iconSvg)}`;
  link.href = encodedSvg;

  try {
    localStorage.setItem('unblock_cloak_profile', profileId);
    if (customTitle) {
      localStorage.setItem('unblock_custom_title', customTitle);
    }
  } catch {}
}
