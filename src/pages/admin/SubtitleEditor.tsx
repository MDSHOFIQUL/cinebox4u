import React, { useState } from 'react';
import { Movie, Series, SubtitleTrack } from '../../types';
import { Subtitles, Plus, Trash2, Clock, Download, Save, RefreshCw, FileText } from 'lucide-react';

interface SubtitleEditorProps {
  movies: Movie[];
  series: Series[];
  onSaveTrack?: (mediaId: string, track: SubtitleTrack) => void;
}

interface SubtitleCue {
  id: string;
  start: string; // "00:01:10.000"
  end: string;   // "00:01:15.000"
  text: string;
}

export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ movies, series, onSaveTrack }) => {
  const allMedia = [...movies, ...series];
  const [selectedMediaId, setSelectedMediaId] = useState<string>(allMedia[0]?.id || '');
  const [trackLanguage, setTrackLanguage] = useState<string>('en');
  const [trackLabel, setTrackLabel] = useState<string>('English [CC]');

  const [cues, setCues] = useState<SubtitleCue[]>([
    { id: '1', start: '00:00:15.000', end: '00:00:19.500', text: '[Dramatic orchestral theme playing]' },
    { id: '2', start: '00:00:21.000', end: '00:00:25.800', text: 'In a world beyond our reckoning...' },
    { id: '3', start: '00:00:28.000', end: '00:00:32.400', text: 'Welcome to CineBox4u.' },
  ]);

  const [rawVtt, setRawVtt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'raw'>('editor');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Time conversion helpers
  const parseSeconds = (timestamp: string): number => {
    const parts = timestamp.split(':');
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseFloat(s);
    }
    return 0;
  };

  const formatSeconds = (total: number): string => {
    const t = Math.max(0, total);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = (t % 60).toFixed(3);
    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    const sParts = s.split('.');
    const secPadded = pad(parseInt(sParts[0], 10)) + '.' + (sParts[1] || '000').padEnd(3, '0');
    return `${pad(h)}:${pad(m)}:${secPadded}`;
  };

  const shiftAllCues = (deltaSeconds: number) => {
    setCues(
      cues.map((c) => ({
        ...c,
        start: formatSeconds(parseSeconds(c.start) + deltaSeconds),
        end: formatSeconds(parseSeconds(c.end) + deltaSeconds),
      }))
    );
  };

  const addCue = () => {
    const last = cues[cues.length - 1];
    const newStartSec = last ? parseSeconds(last.end) + 1.0 : 0;
    const newCue: SubtitleCue = {
      id: Date.now().toString(),
      start: formatSeconds(newStartSec),
      end: formatSeconds(newStartSec + 4.0),
      text: 'New subtitle dialogue...',
    };
    setCues([...cues, newCue]);
  };

  const removeCue = (id: string) => {
    setCues(cues.filter((c) => c.id !== id));
  };

  const updateCue = (id: string, updates: Partial<SubtitleCue>) => {
    setCues(cues.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const generateVttText = (): string => {
    let out = 'WEBVTT\n\n';
    cues.forEach((c, idx) => {
      out += `${idx + 1}\n`;
      out += `${c.start} --> ${c.end}\n`;
      out += `${c.text}\n\n`;
    });
    return out;
  };

  const handleExportVtt = () => {
    const text = generateVttText();
    const blob = new Blob([text], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinebox4u_${selectedMediaId}_${trackLanguage}.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToMedia = () => {
    const vttData = generateVttText();
    // Simulate blob URL storage or callback
    const trackBlobUrl = `data:text/vtt;charset=utf-8,${encodeURIComponent(vttData)}`;
    const newTrack: SubtitleTrack = {
      id: `sub_${Date.now()}`,
      language: trackLanguage,
      label: trackLabel,
      url: trackBlobUrl,
      isDefault: trackLanguage === 'en',
    };

    if (onSaveTrack) {
      onSaveTrack(selectedMediaId, newTrack);
    }

    setStatusMessage(`Saved ${trackLabel} subtitle track to selected media.`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleImportRawVtt = () => {
    try {
      const lines = rawVtt.split('\n').map((l) => l.trim());
      const parsed: SubtitleCue[] = [];
      let i = 0;
      while (i < lines.length) {
        if (lines[i].includes('-->')) {
          const [startStr, endStr] = lines[i].split('-->').map((s) => s.trim());
          i++;
          let text = '';
          while (i < lines.length && lines[i] !== '') {
            text += (text ? ' ' : '') + lines[i];
            i++;
          }
          parsed.push({
            id: (parsed.length + 1).toString(),
            start: startStr.length === 8 ? `00:${startStr}` : startStr,
            end: endStr.length === 8 ? `00:${endStr}` : endStr,
            text: text || '[Dialogue]',
          });
        }
        i++;
      }
      if (parsed.length > 0) {
        setCues(parsed);
        setActiveTab('editor');
        setStatusMessage(`Successfully parsed ${parsed.length} subtitle cues from WebVTT.`);
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        alert('Could not find timestamp markers (-->) in input text.');
      }
    } catch (err: any) {
      alert(`Parse error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Subtitles className="w-5 h-5 text-red-500" />
            WebVTT Subtitle Studio
          </h2>
          <p className="text-xs text-zinc-400">
            Create, adjust audio synchronizations, and publish multi-language captions for streaming titles.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => shiftAllCues(-0.5)}
            className="px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center gap-1 font-mono transition"
            title="Shift all cues 0.5s earlier"
          >
            -0.5s
          </button>
          <button
            onClick={() => shiftAllCues(0.5)}
            className="px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center gap-1 font-mono transition"
            title="Shift all cues 0.5s later"
          >
            +0.5s
          </button>
          <button
            onClick={handleExportVtt}
            className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export .VTT
          </button>
          <button
            onClick={handleSaveToMedia}
            className="px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 shadow-md shadow-red-600/20 transition"
          >
            <Save className="w-3.5 h-3.5" />
            Publish Subtitle
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2">
          <Save className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Target media and track settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs">
        <div>
          <label className="block text-zinc-400 font-semibold mb-1">Target Movie / Series</label>
          <select
            value={selectedMediaId}
            onChange={(e) => setSelectedMediaId(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
          >
            {allMedia.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.type.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-zinc-400 font-semibold mb-1">Language Code</label>
          <input
            type="text"
            value={trackLanguage}
            onChange={(e) => setTrackLanguage(e.target.value)}
            placeholder="e.g. en, bn, es, hi"
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-zinc-400 font-semibold mb-1">Track Label</label>
          <input
            type="text"
            value={trackLabel}
            onChange={(e) => setTrackLabel(e.target.value)}
            placeholder="e.g. Bangla [বাংলা], English CC"
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Editor / Raw VTT toggle */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'editor' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Timeline Cue Editor ({cues.length})
        </button>
        <button
          onClick={() => {
            setRawVtt(generateVttText());
            setActiveTab('raw');
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'raw' ? 'border-red-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Raw WebVTT Text Import/Export
        </button>
      </div>

      {activeTab === 'editor' ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400 font-medium">Subtitle Timeline Cues</span>
            <button
              onClick={addCue}
              className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-red-400 rounded-lg flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Cue
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {cues.map((cue, idx) => (
              <div
                key={cue.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:border-zinc-700 transition"
              >
                <span className="text-xs font-mono font-bold text-zinc-500 w-6 text-center shrink-0">
                  #{idx + 1}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={cue.start}
                    onChange={(e) => updateCue(cue.id, { start: e.target.value })}
                    className="w-24 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs font-mono text-zinc-200 text-center"
                  />
                  <span className="text-zinc-500 text-xs font-mono">→</span>
                  <input
                    type="text"
                    value={cue.end}
                    onChange={(e) => updateCue(cue.id, { end: e.target.value })}
                    className="w-24 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs font-mono text-zinc-200 text-center"
                  />
                </div>

                <input
                  type="text"
                  value={cue.text}
                  onChange={(e) => updateCue(cue.id, { text: e.target.value })}
                  placeholder="Subtitle caption dialogue..."
                  className="flex-1 w-full px-3 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white"
                />

                <button
                  onClick={() => removeCue(cue.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 transition shrink-0"
                  title="Delete cue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            rows={14}
            value={rawVtt}
            onChange={(e) => setRawVtt(e.target.value)}
            className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 leading-relaxed focus:outline-none focus:border-red-500"
            placeholder="Paste WEBVTT content here..."
          />
          <button
            onClick={handleImportRawVtt}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Parse & Load Into Cue Editor
          </button>
        </div>
      )}
    </div>
  );
};
