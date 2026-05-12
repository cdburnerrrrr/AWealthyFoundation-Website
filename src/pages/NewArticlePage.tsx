import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, DragEvent, ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CreditCard,
  DollarSign,
  Image,
  Lightbulb,
  PiggyBank,
  Save,
  Shield,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  BUILDING_BLOCKS,
  BUILDING_BLOCK_META,
  type BuildingBlockKey,
} from '../data/foundationArticles';

const BLOCK_ICONS: Record<BuildingBlockKey, ElementType> = {
  vision: Lightbulb,
  protection: Shield,
  investing: TrendingUp,
  spending: Wallet,
  saving: PiggyBank,
  income: DollarSign,
  debt: CreditCard,
};

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const insertImageFile = async (file: File) => {
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl && editorRef.current) {
          editorRef.current.focus();
          document.execCommand(
            'insertHTML',
            false,
            `<img src="${dataUrl}" alt="Article image" style="max-width: 100%; border-radius: 16px; margin: 24px 0;" />`
          );
          onChange(editorRef.current.innerHTML);
        }
        resolve();
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData.items;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (item.type.includes('image')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) await insertImageFile(file);
        return;
      }
    }

    event.preventDefault();
    const html = event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, html);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
    window.setTimeout(() => {
      isInternalChange.current = false;
    }, 0);
  };

  const applyFormat = (command: string, commandValue?: string) => {
    focusEditor();
    window.setTimeout(() => {
      document.execCommand(command, false, commandValue);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }, 0);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (file.type.startsWith('image/')) await insertImageFile(file);
      }
    }
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (editorRef.current) editorRef.current.style.backgroundColor = '#eef8ff';
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    if (editorRef.current) editorRef.current.style.backgroundColor = '';
  };

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    if (editorRef.current) editorRef.current.style.backgroundColor = '';

    const files = event.dataTransfer.files;
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      if (file.type.startsWith('image/')) await insertImageFile(file);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="sticky top-[74px] z-20 flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
        <button type="button" onMouseDown={(event) => { event.preventDefault(); applyFormat('bold'); }} className="rounded-lg px-3 py-2 font-bold text-slate-700 hover:bg-slate-200">B</button>
        <button type="button" onMouseDown={(event) => { event.preventDefault(); applyFormat('italic'); }} className="rounded-lg px-3 py-2 italic text-slate-700 hover:bg-slate-200">I</button>
        <button type="button" onMouseDown={(event) => { event.preventDefault(); applyFormat('formatBlock', 'h3'); }} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">H</button>
        <div className="mx-1 h-6 w-px bg-slate-300" />
        <button type="button" onMouseDown={(event) => { event.preventDefault(); applyFormat('insertUnorderedList'); }} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-200">• List</button>
        <button type="button" onMouseDown={(event) => { event.preventDefault(); applyFormat('insertOrderedList'); }} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-200">1. List</button>
        <div className="mx-1 h-6 w-px bg-slate-300" />
        <label className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-200" title="Upload Image">
          <Image className="h-4 w-4" />
          <span className="text-xs font-semibold">Upload</span>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </label>
        <span className="ml-2 hidden text-xs text-slate-400 lg:inline">Drag, drop, or paste images into the article.</span>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onPaste={handlePaste}
        onInput={handleInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="min-h-[420px] max-w-none p-5 leading-8 text-slate-700 outline-none prose prose-slate"
        data-placeholder="Start writing your article here."
        suppressContentEditableWarning
      />
    </div>
  );
}

export default function NewArticlePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<BuildingBlockKey | null>(null);
  const [readTime, setReadTime] = useState('8 min read');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !excerpt || !selectedBlock || !content) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    alert('Article saved successfully. In production, this would be saved to the database.');
    setSaving(false);
    navigate('/articles');
  };

  const estimatedMinutes = Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 200));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-navy-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-copper-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-copper-700">
              <BookOpen className="h-4 w-4" />
              Article Editor
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-navy-900">Create New Article</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Draft new content around the 7 Building Blocks. The public article pages now use the shared site header, so this editor stays focused on writing.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-copper-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-copper-600/15 transition hover:bg-copper-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Publish Article'}
          </button>
        </div>

        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-7">
          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-900">
              Article Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter a useful, specific title..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg text-navy-900 outline-none transition focus:border-copper-400 focus:ring-4 focus:ring-copper-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-900">
              Excerpt <span className="text-red-500">*</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="Write the short summary that appears on the Articles page."
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-navy-900 outline-none transition focus:border-copper-400 focus:ring-4 focus:ring-copper-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-900">
              Building Block <span className="text-red-500">*</span>
            </label>
            <p className="mb-3 text-sm text-slate-500">Select the part of the Financial House this article strengthens.</p>
            <div className="flex flex-wrap gap-2">
              {BUILDING_BLOCKS.map((block) => {
                const Icon = BLOCK_ICONS[block.id];
                const meta = BUILDING_BLOCK_META[block.id];
                const selected = selectedBlock === block.id;
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => setSelectedBlock(block.id)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? `${meta.bg} ${meta.text} ${meta.border} ring-2 ${meta.ring}`
                        : 'border-slate-200 bg-white text-slate-600 hover:border-copper-300 hover:text-copper-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {block.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-900">Estimated Read Time</label>
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="text"
                value={readTime}
                onChange={(event) => setReadTime(event.target.value)}
                placeholder="8 min read"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-navy-900 outline-none transition focus:border-copper-400 focus:ring-4 focus:ring-copper-100"
              />
              <div className="inline-flex items-center gap-1 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>Current draft estimate: {estimatedMinutes} min read</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-900">
              Article Content <span className="text-red-500">*</span>
            </label>
            <p className="mb-3 text-sm text-slate-500">
              Use headings, examples, charts, and images where they make the article easier to understand.
            </p>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="rounded-2xl border border-copper-200 bg-copper-50 p-4">
            <h4 className="font-bold text-navy-900">AWF article checklist</h4>
            <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">
              <li>• Tie the topic to one Building Block.</li>
              <li>• Use Vision as the directional Building Block.</li>
              <li>• Include one practical example or chart.</li>
              <li>• End with a clear next step.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
