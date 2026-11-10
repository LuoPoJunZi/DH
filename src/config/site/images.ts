export const imageConfig = {
  // Small brand icon supplied by the site owner, shared by the header and footer.
  logo: '/brand/logo-avatar-128.png',
  logoFallback: '/favicon-96x96.png',
  // Formal screenshots should use the project owner's image host, not the Git repository.
  projectPreview: '',
  // Wallpaper endpoints provided by the site owner; requested directly by the browser.
  backgroundDesktop: 'https://api.yppp.net/pc.php',
  backgroundMobile: 'https://api.yppp.net/pe.php',
} as const;
