import React, { useState, useRef, useMemo } from 'react';
import { 
  X, FolderOpen, Upload, Trash2, Eye, Download, Copy, Check, 
  FileText, Image as ImageIcon, Music, Database, HardDrive, 
  Search, Filter, ShieldCheck, AlertCircle, RefreshCw, Sparkles, ExternalLink
} from 'lucide-react';
import { StorageFile } from '../../types';
import { storageManager, formatBytes } from '../../lib/storageManager';

interface CloudFileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  sellerId?: string;
  storeName?: string;
  planName?: string;
  totalCapacityGb?: number;
  onStorageUpdated?: () => void;
}

export const CloudFileManagerModal: React.FC<CloudFileManagerModalProps> = ({
  isOpen,
  onClose,
  language = 'bn',
  sellerId,
  storeName = 'আমার বাজার ডিজিটাল স্টোর',
  planName = 'STARTER প্ল্যান',
  totalCapacityGb = 2,
  onStorageUpdated
}) => {
  const [files, setFiles] = useState<StorageFile[]>(() => storageManager.getFiles(sellerId));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recalculate stats live
  const stats = useMemo(() => {
    return storageManager.calculateStats(files, totalCapacityGb);
  }, [files, totalCapacityGb]);

  // Filter files
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchCat = selectedCategory === 'all' || file.category === selectedCategory;
      const matchSearch = !searchQuery || 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.associatedWith && file.associatedWith.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [files, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFileList = e.target.files;
    if (!uploadedFileList || uploadedFileList.length === 0) return;

    setIsUploading(true);
    const file = uploadedFileList[0];

    // Determine category
    let category: StorageFile['category'] = 'data';
    if (file.type.startsWith('image/')) category = 'image';
    else if (file.type === 'application/pdf') category = 'pdf';
    else if (file.type.startsWith('audio/')) category = 'audio';
    else if (file.type.includes('word') || file.type.includes('text') || file.type.includes('document')) category = 'document';

    // Create file reader to generate usable local preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string || '#';
      
      const newFile = storageManager.addFile({
        name: file.name,
        url: dataUrl,
        sizeBytes: file.size,
        category,
        mimeType: file.type || 'application/octet-stream',
        associatedWith: `Manual Upload (${new Date().toLocaleDateString()})`,
        sellerId
      });

      const updated = storageManager.getFiles(sellerId);
      setFiles(updated);
      setIsUploading(false);
      setUploadSuccessMsg(language === 'bn' ? `"${file.name}" সফলভাবে ক্লাউডে আপলোড হয়েছে!` : `"${file.name}" uploaded successfully!`);
      if (onStorageUpdated) onStorageUpdated();

      setTimeout(() => setUploadSuccessMsg(''), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteFile = (id: string, fileName: string) => {
    const confirmMsg = language === 'bn' 
      ? `আপনি কি নিশ্চিত যে "${fileName}" ফাইলটি ক্লাউড থেকে স্থায়ীভাবে ডিলিট করতে চান? এতে স্টোরেজ স্পেস খালি হবে।`
      : `Are you sure you want to delete "${fileName}"? This will free up storage space.`;
    
    if (window.confirm(confirmMsg)) {
      const updated = storageManager.deleteFile(id);
      setFiles(updated);
      if (previewFile?.id === id) setPreviewFile(null);
      if (onStorageUpdated) onStorageUpdated();
      setUploadSuccessMsg(language === 'bn' ? `"${fileName}" ডিলিট করা হয়েছে এবং মেমোরি খালি হয়েছে।` : `"${fileName}" deleted successfully.`);
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Database className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-xs">
        
        {/* TOP HEADER BAR */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  {language === 'bn' ? 'ক্লাউড স্টোরেজ ও ফাইল ম্যানেজার' : 'Cloud Storage & File Manager'}
                </h3>
                <span className="inline-flex items-center space-x-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Supabase Live Cloud</span>
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                {storeName} • <span className="font-semibold text-emerald-600 dark:text-emerald-400">{planName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {uploadSuccessMsg && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
            <button onClick={() => setUploadSuccessMsg('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* CAPACITY AND REAL-TIME METER CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    {language === 'bn' ? 'স্টোরেজ ব্যবহার ও লাইভ ক্যাপাসিটি' : 'Live Storage Meter'}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                    {stats.formattedUsed}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    / {stats.formattedTotal} ({stats.percentage}% {language === 'bn' ? 'পূর্ণ' : 'used'})
                  </span>
                </div>
              </div>

              {/* Upload trigger button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,application/pdf,audio/*,.doc,.docx,.json,.txt"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl transition flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                  <span>
                    {isUploading 
                      ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...')
                      : (language === 'bn' ? '+ নতুন ফাইল আপলোড করুন' : '+ Upload New File')
                    }
                  </span>
                </button>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-4 space-y-1.5">
              <div className="w-full bg-slate-800/80 rounded-full h-3 p-0.5 overflow-hidden border border-slate-700/50">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    stats.percentage >= 85 ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, stats.percentage))}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-0.5">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  <span>{language === 'bn' ? 'ব্যবহৃত:' : 'Used:'} {stats.formattedUsed}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-slate-600 inline-block"></span>
                  <span>{language === 'bn' ? 'ফাঁকা রয়েছে:' : 'Free Space:'} {stats.formattedFree}</span>
                </span>
              </div>
            </div>

            {/* MINI STATS TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 text-[10.5px]">
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/40">
                <span className="text-slate-400 block">{language === 'bn' ? 'মোট ফাইল:' : 'Total Files:'}</span>
                <span className="font-extrabold text-slate-200">{stats.count} {language === 'bn' ? 'টি' : 'files'}</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/40">
                <span className="text-slate-400 block">{language === 'bn' ? 'ছবির সাইজ:' : 'Images:'}</span>
                <span className="font-extrabold text-blue-400">{stats.breakdown.image.formattedSize} ({stats.breakdown.image.count})</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/40">
                <span className="text-slate-400 block">{language === 'bn' ? 'পিডিএফ / ইনভয়েস:' : 'PDFs & Memos:'}</span>
                <span className="font-extrabold text-rose-400">{stats.breakdown.pdf.formattedSize} ({stats.breakdown.pdf.count})</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/40">
                <span className="text-slate-400 block">{language === 'bn' ? 'চ্যাট ও অডিও:' : 'Chat Audio:'}</span>
                <span className="font-extrabold text-amber-400">{stats.breakdown.audio.formattedSize} ({stats.breakdown.audio.count})</span>
              </div>
            </div>
          </div>

          {/* CONTROLS: CATEGORY TABS & SEARCH */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
            {/* Category Filter Chips */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: language === 'bn' ? 'সব ফাইল' : 'All Files', count: files.length },
                { id: 'image', label: language === 'bn' ? 'ছবি ও ব্যানার' : 'Images', count: stats.breakdown.image.count },
                { id: 'pdf', label: language === 'bn' ? 'পিডিএফ ও ইনভয়েস' : 'PDF & Docs', count: stats.breakdown.pdf.count },
                { id: 'audio', label: language === 'bn' ? 'অডিও ও ভয়েস' : 'Voice/Audio', count: stats.breakdown.audio.count },
                { id: 'data', label: language === 'bn' ? 'ডাটা ও ব্যাকআপ' : 'Data/JSON', count: stats.breakdown.data.count },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 whitespace-nowrap text-[11px] cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    selectedCategory === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative shrink-0 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'ফাইল খুঁজুন...' : 'Search files...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* FILES LIST / GRID */}
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-slate-850/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  {language === 'bn' ? 'কোনো ফাইল পাওয়া যায়নি' : 'No files found'}
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {searchQuery 
                    ? (language === 'bn' ? 'আপনার সার্চ অনুযায়ী কোনো ফাইল নেই।' : 'No files match your query.')
                    : (language === 'bn' ? 'স্টোরেজ খালি রয়েছে। নতুন ছবি বা ফাইল আপলোড করতে উপরের বাটনে ক্লিক করুন।' : 'Storage is empty. Upload images or PDFs to see them here.')
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition inline-flex items-center space-x-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ফাইল আপলোড করুন' : 'Upload File'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-emerald-500/40 hover:shadow-xs transition group"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center space-x-3 truncate min-w-0">
                    {/* Thumbnail / Icon */}
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                      {file.category === 'image' && file.url && file.url !== '#' ? (
                        <img 
                          src={file.url} 
                          alt={file.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Fallback if image fails
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        getCategoryIcon(file.category)
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="truncate min-w-0">
                      <p className="font-extrabold text-slate-800 dark:text-slate-100 truncate text-[11.5px]" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 truncate">
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-xs">
                          {file.formattedSize}
                        </span>
                        <span>•</span>
                        <span className="truncate">{file.uploadedAt}</span>
                      </div>
                      {file.associatedWith && (
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={file.associatedWith}>
                          📁 {file.associatedWith}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      title={language === 'bn' ? 'ফাইল দেখুন' : 'Preview'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(file.url, file.id)}
                      title={language === 'bn' ? 'লিংক কপি করুন' : 'Copy Link'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
                    >
                      {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file.id, file.name)}
                      title={language === 'bn' ? 'ডিলিট করুন' : 'Delete'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* BOTTOM FOOTER BAR */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between text-slate-500 text-[11px] shrink-0">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {language === 'bn' 
                ? 'সুপাবেস ডাটাবেস ও স্টোরেজ সম্পূর্ণ এনক্রিপ্টেড এবং সুরক্ষিত'
                : 'Supabase Cloud Storage is fully encrypted & secure'
              }
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>

      {/* FULL-SIZE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-4 space-y-3 shadow-2xl border border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="truncate">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate">{previewFile.name}</h4>
                <p className="text-[10px] text-slate-400">{previewFile.formattedSize} • {previewFile.mimeType}</p>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-xl p-2 min-h-[220px]">
              {previewFile.category === 'image' ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-h-[55vh] object-contain rounded-lg shadow"
                  referrerPolicy="no-referrer"
                />
              ) : previewFile.category === 'audio' ? (
                <div className="w-full max-w-md p-4 text-center space-y-3">
                  <Music className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                  <p className="text-white font-bold">{previewFile.name}</p>
                  <audio controls className="w-full">
                    <source src={previewFile.url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div className="text-center p-8 space-y-3 text-slate-300">
                  <FileText className="w-14 h-14 text-rose-500 mx-auto" />
                  <p className="font-bold">{previewFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {language === 'bn' ? 'ডকুমেন্ট / পিডিএফ প্রিভিউ' : 'Document / PDF File'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => handleDeleteFile(previewFile.id, previewFile.name)}
                className="px-3 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold rounded-xl flex items-center space-x-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডিলিট করুন' : 'Delete'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(previewFile.url, previewFile.id)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === previewFile.id ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
                >
                  {language === 'bn' ? 'ঠিক আছে' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
