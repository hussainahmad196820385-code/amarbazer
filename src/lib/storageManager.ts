import { StorageFile, Product, SellerStore } from '../types';

const STORAGE_KEY = 'amarbazar_custom_storage_files';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initial mock files to provide a rich, realistic cloud storage state
const DEFAULT_FILES: StorageFile[] = [
  {
    id: 'file-img-1',
    name: 'rajshahi_himsagar_mango_hd.jpg',
    url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    sizeBytes: 3.4 * 1024 * 1024,
    formattedSize: '3.40 MB',
    category: 'image',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-15 11:20 AM',
    associatedWith: 'Product: Rajshahi Himsagar Mango',
    sellerId: 'sel-1'
  },
  {
    id: 'file-img-2',
    name: 'smart_watch_ultra_pro_titanium.webp',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    sizeBytes: 2.1 * 1024 * 1024,
    formattedSize: '2.10 MB',
    category: 'image',
    mimeType: 'image/webp',
    uploadedAt: '2026-08-16 02:45 PM',
    associatedWith: 'Product: Ultra Smart Watch',
    sellerId: 'sel-1'
  },
  {
    id: 'file-img-3',
    name: 'dhaka_tech_store_banner_4k.jpg',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 5.8 * 1024 * 1024,
    formattedSize: '5.80 MB',
    category: 'image',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-10 09:12 AM',
    associatedWith: 'Store Banner: Dhaka Tech Store',
    sellerId: 'sel-1'
  },
  {
    id: 'file-pdf-1',
    name: 'trade_license_gov_bd_2026.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 1.85 * 1024 * 1024,
    formattedSize: '1.85 MB',
    category: 'pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-01 04:30 PM',
    associatedWith: 'Legal: Trade License (ঢাকা উত্তর সিটি)',
    sellerId: 'sel-1'
  },
  {
    id: 'file-pdf-2',
    name: 'tax_return_certificate_etin.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 2.4 * 1024 * 1024,
    formattedSize: '2.40 MB',
    category: 'pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-05 01:10 PM',
    associatedWith: 'Legal: e-TIN / Tax Certificate',
    sellerId: 'sel-1'
  },
  {
    id: 'file-pdf-3',
    name: 'order_memo_inv_98412.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 680 * 1024,
    formattedSize: '680 KB',
    category: 'pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-18 06:14 PM',
    associatedWith: 'Invoice: Order #ORD-83921',
    sellerId: 'sel-1'
  },
  {
    id: 'file-audio-1',
    name: 'customer_voice_order_memo.mp3',
    url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
    sizeBytes: 1.4 * 1024 * 1024,
    formattedSize: '1.40 MB',
    category: 'audio',
    mimeType: 'audio/mpeg',
    uploadedAt: '2026-08-17 08:22 PM',
    associatedWith: 'Customer Chat: Voice Note (Karim)',
    sellerId: 'sel-1'
  },
  {
    id: 'file-data-1',
    name: 'inventory_catalog_export_august.json',
    url: '#',
    sizeBytes: 420 * 1024,
    formattedSize: '420 KB',
    category: 'data',
    mimeType: 'application/json',
    uploadedAt: '2026-08-18 10:00 AM',
    associatedWith: 'Database: Catalog Backup',
    sellerId: 'sel-1'
  }
];

export const storageManager = {
  getFiles(sellerId?: string): StorageFile[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (sellerId) {
            return parsed.filter((f: StorageFile) => !f.sellerId || f.sellerId === sellerId);
          }
          return parsed;
        }
      }
    } catch (e) {}

    // First time setup
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FILES));
    } catch (e) {}
    return DEFAULT_FILES;
  },

  saveFiles(files: StorageFile[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (e) {}
  },

  addFile(file: Omit<StorageFile, 'id' | 'uploadedAt' | 'formattedSize'>): StorageFile {
    const files = this.getFiles();
    const newFile: StorageFile = {
      ...file,
      id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      uploadedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      formattedSize: formatBytes(file.sizeBytes)
    };
    const updated = [newFile, ...files];
    this.saveFiles(updated);
    return newFile;
  },

  deleteFile(id: string): StorageFile[] {
    const files = this.getFiles();
    const updated = files.filter(f => f.id !== id);
    this.saveFiles(updated);
    return updated;
  },

  calculateStats(files: StorageFile[], totalGb: number = 2) {
    const totalBytes = totalGb * 1024 * 1024 * 1024;
    const usedBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    const freeBytes = Math.max(0, totalBytes - usedBytes);

    const usedMb = usedBytes / (1024 * 1024);
    const totalMb = totalBytes / (1024 * 1024);
    const freeMb = freeBytes / (1024 * 1024);

    const usedGb = usedBytes / (1024 * 1024 * 1024);
    const freeGb = freeBytes / (1024 * 1024 * 1024);

    const percentage = totalBytes > 0 ? parseFloat(((usedBytes / totalBytes) * 100).toFixed(1)) : 0;

    const breakdown: Record<string, { sizeBytes: number; formattedSize: string; count: number }> = {
      image: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
      pdf: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
      audio: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
      document: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
      data: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
    };

    files.forEach(f => {
      const cat = f.category || 'data';
      if (!breakdown[cat]) {
        breakdown[cat] = { sizeBytes: 0, formattedSize: '0 MB', count: 0 };
      }
      breakdown[cat].sizeBytes += f.sizeBytes || 0;
      breakdown[cat].count += 1;
    });

    Object.keys(breakdown).forEach(k => {
      breakdown[k].formattedSize = formatBytes(breakdown[k].sizeBytes);
    });

    return {
      usedBytes,
      freeBytes,
      totalBytes,
      usedMb: parseFloat(usedMb.toFixed(2)),
      freeMb: parseFloat(freeMb.toFixed(2)),
      totalMb: parseFloat(totalMb.toFixed(2)),
      usedGb: parseFloat(usedGb.toFixed(3)),
      freeGb: parseFloat(freeGb.toFixed(2)),
      totalGb,
      formattedUsed: formatBytes(usedBytes),
      formattedFree: formatBytes(freeBytes),
      formattedTotal: `${totalGb} GB`,
      percentage: Math.max(0.1, percentage), // always show readable percentage if files exist
      count: files.length,
      breakdown
    };
  }
};
