// imageSource.ts - Service for loading level images from various sources

export type ImageSource = 'default' | 'local' | 'custom';

export interface ImageConfig {
  source: ImageSource;
  localPath?: string; // For custom folder path
}

// Default Unsplash images by theme
const defaultImages: Record<string, string[]> = {
  kitchen: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80',
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&q=80',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80',
  ],
  garden: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
    'https://images.unsplash.com/photo-1558693168-c370615b54e0?w=800&q=80',
    'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&q=80',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80',
    'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&q=80',
  ],
  fantasy: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    'https://images.unsplash.com/photo-1501862700950-18382cd41497?w=800&q=80',
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&q=80',
    'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    'https://images.unsplash.com/photo-1540206395-68808572332f?w=800&q=80',
  ],
  retro: [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ],
};

// Image MIME types we accept
const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// Image file extensions fallback (for when MIME is empty)
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

// Track active object URLs for cleanup
let activeObjectUrls: string[] = [];

// Cache for discovered local images
let localImagesCache: string[] | null = null;
let localImagesByTheme: Record<string, string[]> | null = null;

// Known theme names for categorization
const THEME_NAMES = ['kitchen', 'garden', 'fantasy', 'retro'];

function isImageFile(file: File): boolean {
  if (file.type && IMAGE_MIME_TYPES.has(file.type)) return true;
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function categorizeByTheme(fileName: string): string {
  const lower = fileName.toLowerCase();
  for (const theme of THEME_NAMES) {
    if (lower.includes(theme)) return theme;
  }
  return 'custom';
}

/**
 * Read images from a user-selected folder via browser directory picker.
 * Uses showDirectoryPicker (Chrome/Edge) with <input webkitdirectory> fallback (Firefox/Safari).
 * Returns null if the user cancels.
 */
export async function readFolderImages(): Promise<{
  all: string[];
  byTheme: Record<string, string[]>;
} | null> {
  let files: File[];

  // Try File System Access API (Chrome/Edge)
  if ('showDirectoryPicker' in window) {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      files = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          const file: File = await entry.getFile();
          if (isImageFile(file)) {
            files.push(file);
          }
        }
      }
    } catch (e: any) {
      // User cancelled or permission denied
      if (e?.name === 'AbortError') return null;
      console.warn('[Images] showDirectoryPicker failed, trying fallback:', e);
      const result = await readFolderImagesFallback();
      return result;
    }
  } else {
    // Fallback: <input webkitdirectory>
    const result = await readFolderImagesFallback();
    return result;
  }

  if (files.length === 0) return { all: [], byTheme: {} };

  // Sort alphabetically for deterministic assignment
  files.sort((a, b) => a.name.localeCompare(b.name));

  // Revoke any previously created URLs
  revokeLocalFolderImages();

  const all: string[] = [];
  const byTheme: Record<string, string[]> = {};

  for (const file of files) {
    const url = URL.createObjectURL(file);
    activeObjectUrls.push(url);
    all.push(url);

    const theme = categorizeByTheme(file.name);
    if (!byTheme[theme]) byTheme[theme] = [];
    byTheme[theme].push(url);
  }

  return { all, byTheme };
}

/**
 * Fallback folder picker using <input webkitdirectory> for Firefox/Safari.
 */
function readFolderImagesFallback(): Promise<{
  all: string[];
  byTheme: Record<string, string[]>;
} | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('webkitdirectory', '');
    input.multiple = true;
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    let resolved = false;

    input.addEventListener('change', () => {
      resolved = true;
      document.body.removeChild(input);

      const fileList = input.files;
      if (!fileList || fileList.length === 0) {
        resolve(null);
        return;
      }

      const files = Array.from(fileList).filter(isImageFile);
      if (files.length === 0) {
        resolve({ all: [], byTheme: {} });
        return;
      }

      files.sort((a, b) => a.name.localeCompare(b.name));

      // Revoke any previously created URLs
      revokeLocalFolderImages();

      const all: string[] = [];
      const byTheme: Record<string, string[]> = {};

      for (const file of files) {
        const url = URL.createObjectURL(file);
        activeObjectUrls.push(url);
        all.push(url);

        const theme = categorizeByTheme(file.name);
        if (!byTheme[theme]) byTheme[theme] = [];
        byTheme[theme].push(url);
      }

      resolve({ all, byTheme });
    });

    // Handle cancel: the input element won't fire 'change' if cancelled.
    // Use a focus event on window to detect when the dialog closes without selection.
    const handleFocus = () => {
      setTimeout(() => {
        if (!resolved) {
          if (input.parentNode) document.body.removeChild(input);
          resolve(null);
        }
        window.removeEventListener('focus', handleFocus);
      }, 300);
    };
    window.addEventListener('focus', handleFocus);

    input.click();
  });
}

/**
 * Revoke all active object URLs created by readFolderImages.
 */
export function revokeLocalFolderImages(): void {
  for (const url of activeObjectUrls) {
    URL.revokeObjectURL(url);
  }
  activeObjectUrls = [];
}

// Get image URL for a level
export function getImageForLevel(
  levelNumber: number,
  theme: string,
  localImages?: { all: string[]; byTheme: Record<string, string[]> }
): string {
  // If local images are available, prefer them
  if (localImages) {
    // First try theme-specific local images
    const themeImages = localImages.byTheme[theme];
    if (themeImages && themeImages.length > 0) {
      const index = (levelNumber - 1) % themeImages.length;
      return themeImages[index];
    }

    // Then try custom/numbered local images
    const customImages = localImages.byTheme.custom;
    if (customImages && customImages.length > 0) {
      const index = (levelNumber - 1) % customImages.length;
      return customImages[index];
    }
  }

  // Fall back to default Unsplash images
  const themeDefaults = defaultImages[theme] || defaultImages.kitchen;
  const index = (levelNumber - 1) % themeDefaults.length;
  return themeDefaults[index];
}

// Clear the cache (useful when user adds new images)
export function clearImageCache(): void {
  localImagesCache = null;
  localImagesByTheme = null;
}

// Get default images for a theme
export function getDefaultImages(theme: string): string[] {
  return defaultImages[theme] || defaultImages.kitchen;
}
