import React, { useState } from 'react';
import { Movie, Series } from '../../types';
import { FileSpreadsheet, Upload, Download, Check, AlertCircle, FileText, ArrowRight } from 'lucide-react';

interface BulkMovieUploadProps {
  movies: Movie[];
  series?: Series[];
  onImportMovies: (movies: Movie[]) => Promise<void>;
}

export const BulkMovieUpload: React.FC<BulkMovieUploadProps> = ({ movies, series = [], onImportMovies }) => {
  const [jsonText, setJsonText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // CSV Export for Movies
  const handleExportCSV = () => {
    const headers = [
      'id',
      'title',
      'releaseYear',
      'duration',
      'language',
      'category',
      'rating',
      'videoQuality',
      'director',
      'cast',
      'posterUrl',
      'backdropUrl',
    ];

    const rows = movies.map((m) => [
      `"${m.id}"`,
      `"${(m.title || '').replace(/"/g, '""')}"`,
      m.releaseYear,
      `"${m.duration || ''}"`,
      `"${m.language || ''}"`,
      `"${m.category || ''}"`,
      m.rating || 8.0,
      `"${m.videoQuality || '1080p'}"`,
      `"${(m.director || '').replace(/"/g, '""')}"`,
      `"${(m.cast || []).join('; ').replace(/"/g, '""')}"`,
      `"${m.posterUrl || ''}"`,
      `"${m.backdropUrl || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cinebox4u_movies_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'title,releaseYear,duration,language,category,rating,videoQuality,director,cast,streamUrl,posterUrl,backdropUrl,description\n' +
      '"Blade Runner 2099",2026,"2h 15m","English","Sci-Fi & Cyberpunk",8.8,"4K","Denis Villeneuve","Ryan Gosling; Ana de Armas","https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8","https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600","https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600","In a cyberpunk megacity, a rogue synthetic agent unravels deep corporate espionage."\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cinebox4u_movies_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) return;

        // Parse CSV lines
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) throw new Error('CSV is empty or missing data rows.');

        const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
        const importedList: Movie[] = [];

        for (let i = 1; i < lines.length; i++) {
          const rowText = lines[i];
          // Simple regex-based CSV splitter to handle quoted fields
          const values: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let c = 0; c < rowText.length; c++) {
            const char = rowText[c];
            if (char === '"' && (c === 0 || rowText[c - 1] !== '\\')) {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.replace(/^"|"$/g, '').trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.replace(/^"|"$/g, '').trim());

          const rowData: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowData[h] = values[idx] || '';
          });

          if (rowData.title) {
            importedList.push({
              id: `mov-csv-${Date.now()}-${i}`,
              title: rowData.title,
              type: 'movie',
              releaseYear: Number(rowData.releaseYear) || 2025,
              duration: rowData.duration || '2h 00m',
              language: rowData.language || 'English',
              category: rowData.category || 'Action & Adventure',
              genres: rowData.genres ? rowData.genres.split(';') : ['Action', 'Thriller'],
              rating: Number(rowData.rating) || 8.0,
              videoQuality: (rowData.videoQuality as any) || '1080p',
              director: rowData.director || undefined,
              cast: rowData.cast ? rowData.cast.split(';').map((s) => s.trim()) : [],
              posterUrl: rowData.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
              backdropUrl: rowData.backdropUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
              description: rowData.description || 'Imported via CineBox4u CSV batch ingest.',
              isPublished: true,
              viewsCount: 50,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              videoServers: [
                {
                  id: `srv-${Date.now()}-${i}`,
                  mediaId: `mov-csv-${Date.now()}-${i}`,
                  mediaType: 'movie',
                  serverName: 'Cloud Server 1 (HLS)',
                  serverType: 'hls',
                  streamUrl: rowData.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                  quality: '1080p',
                  status: 'active',
                  priority: 1,
                },
              ],
            });
          }
        }

        if (importedList.length === 0) throw new Error('No valid movie rows parsed from CSV.');

        setIsProcessing(true);
        await onImportMovies(importedList);
        setImportStatus(`Successfully parsed and imported ${importedList.length} movies from CSV file!`);
      } catch (err: any) {
        setImportStatus(`CSV Import Error: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  // Process JSON bulk upload
  const handleImportJSON = async () => {
    try {
      setIsProcessing(true);
      setImportStatus(null);
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array of movie objects');

      const sanitized: Movie[] = parsed.map((item: any, idx: number) => ({
        id: item.id || `mov-bulk-${Date.now()}-${idx}`,
        title: item.title || 'Untitled Movie',
        originalTitle: item.originalTitle,
        type: 'movie',
        posterUrl: item.posterUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        backdropUrl: item.backdropUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
        description: item.description || 'No description provided.',
        duration: item.duration || '2h 00m',
        releaseYear: Number(item.releaseYear) || 2025,
        language: item.language || 'English',
        category: item.category || 'Action & Adventure',
        genres: Array.isArray(item.genres) ? item.genres : ['Action'],
        rating: Number(item.rating) || 8.0,
        videoQuality: item.videoQuality || '1080p',
        director: item.director,
        cast: item.cast,
        isPublished: item.isPublished !== false,
        isFeatured: item.isFeatured === true,
        viewsCount: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        videoServers: Array.isArray(item.videoServers)
          ? item.videoServers
          : [
              {
                id: `srv-${Date.now()}-${idx}`,
                mediaId: item.id || `mov-bulk-${Date.now()}-${idx}`,
                mediaType: 'movie',
                serverName: 'Server 1 - Cloud HLS',
                serverType: 'hls',
                streamUrl: item.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                quality: '1080p',
                status: 'active',
                priority: 1,
              },
            ],
      }));

      await onImportMovies(sanitized);
      setImportStatus(`Successfully imported ${sanitized.length} movies into CineBox4u database!`);
      setJsonText('');
    } catch (err: any) {
      setImportStatus(`Import Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInsertTemplate = () => {
    const template = [
      {
        title: 'Cyber Heist: Neon City',
        releaseYear: 2025,
        duration: '1h 58m',
        language: 'English',
        category: 'Sci-Fi & Cyberpunk',
        genres: ['Action', 'Cyberpunk', 'Crime'],
        rating: 8.6,
        videoQuality: '4K',
        director: 'Alex Garland',
        cast: ['Karl Urban', 'Olivia Thirlby'],
        posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
        description: 'Elite neuro-hackers infiltrate an automated orbital fortress to retrieve encrypted bio-keys.',
        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      },
    ];
    setJsonText(JSON.stringify(template, null, 2));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Bulk Movie Upload & CSV Data Suite</h1>
          <p className="text-xs text-zinc-400">
            Import multiple movie records at once via structured CSV/JSON or export current catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>CSV Template</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-red-500" />
            <span>Export All Movies to CSV</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            importStatus.startsWith('Success')
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          {importStatus.startsWith('Success') ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{importStatus}</span>
        </div>
      )}

      {/* CSV File Upload Section */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-red-500" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Method 1: Upload CSV Spreadsheet
          </h2>
        </div>
        <p className="text-xs text-zinc-400">
          Upload a standard spreadsheet (.csv) containing columns like title, releaseYear, duration, category, and streamUrl.
        </p>

        <label className="border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-zinc-950/40 hover:bg-zinc-950/80 transition">
          <Upload className="w-8 h-8 text-zinc-400 mb-2" />
          <span className="text-xs font-bold text-white">Click or drag a CSV file to upload</span>
          <span className="text-[10px] text-zinc-500 mt-1">UTF-8 encoded .csv files up to 10MB</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* JSON Bulk Uploader Box */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Method 2: JSON Batch Payload
            </h2>
          </div>
          <button
            onClick={handleInsertTemplate}
            className="text-xs text-red-400 hover:text-red-300 font-semibold"
          >
            Insert Sample Template
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Paste an array of movie objects. Each object should include title, releaseYear, category, and streamUrl.
        </p>

        <textarea
          rows={8}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="[ { &quot;title&quot;: &quot;Movie Name&quot;, &quot;releaseYear&quot;: 2025, ... } ]"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:outline-hidden focus:border-red-500"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={handleImportJSON}
            disabled={isProcessing || !jsonText.trim()}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60 transition disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? 'Ingesting Batch...' : 'Process & Upload to Database'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
