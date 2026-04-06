import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, User, Menu, X, ChevronRight, Plus, Save, Image,
  TrendingUp, Shield, PiggyBank, CreditCard, Target, BookOpen, Home
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import logoImage from '../assets/house-icon.png';

const NAV_ITEMS = [
  { label: 'The Building Blocks', href: '/building-blocks', isRoute: true },
  { label: 'Financial Pillars', href: '/financial-pillars', isRoute: true },
  { label: 'Foundation Score', href: '/foundation-score', isRoute: true },
  { label: 'Premium', href: '/premium', isRoute: true },
  { label: 'Articles', href: '/articles', isRoute: true },
  { label: 'Newsletter', href: '/newsletter', isRoute: true },
];

const PILLARS = [
  { id: 'income', name: 'Income', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'cashFlow', name: 'Cash Flow', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'debt', name: 'Debt', color: 'bg-red-100 text-red-700 border-red-300' },
  { id: 'protection', name: 'Protection', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'investments', name: 'Investments', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'organization', name: 'Organization', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { id: 'direction', name: 'Direction', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
];

const PILLAR_ICONS: Record<string, React.ElementType> = {
  income: TrendingUp,
  cashFlow: PiggyBank,
  debt: CreditCard,
  protection: Shield,
  investments: TrendingUp,
  organization: BookOpen,
  direction: Target,
};

// Rich text editor component with proper cursor handling
function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Set initial content only once
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (value && !editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value;
      }
    }
  }, []);

  // Focus editor and ensure it's ready for commands
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Handle paste - supports text, HTML, and images
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    // Check for images in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await insertImageFile(file);
        }
        return;
      }
    }
    
    // Handle text/HTML paste
    e.preventDefault();
    const html = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, html);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editorRef.current) {
      editorRef.current.style.backgroundColor = '#f0f9ff';
    }
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editorRef.current) {
      editorRef.current.style.backgroundColor = '';
    }
  };

  // Handle drop - supports images and files
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (editorRef.current) {
      editorRef.current.style.backgroundColor = '';
    }

    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        await insertImageFile(file);
      }
    }
  };

  // Convert file to data URL and insert
  const insertImageFile = async (file: File) => {
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl && editorRef.current) {
          // Focus editor first
          editorRef.current.focus();
          document.execCommand('insertHTML', false, `<img src="${dataUrl}" alt="Article image" style="max-width: 100%; border-radius: 8px; margin: 16px 0;" />`);
          onChange(editorRef.current.innerHTML);
        }
        resolve();
      };
      reader.readAsDataURL(file);
    });
  };

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isInternalChange.current = false;
      }, 0);
    }
  };

  // Apply formatting with proper focus
  const applyFormat = (command: string, value?: string) => {
    focusEditor();
    // Small delay to ensure focus is set
    setTimeout(() => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }, 0);
  };

  // Insert image from file input
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          await insertImageFile(file);
        }
      }
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Sticky Toolbar */}
      <div className="sticky top-14 z-20 bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-1 flex-wrap shadow-sm">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 font-bold"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 italic"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyFormat('formatBlock', 'h3'); }}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 font-semibold text-sm"
          title="Heading"
        >
          H
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyFormat('insertUnorderedList'); }}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 text-lg leading-none"
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyFormat('insertOrderedList'); }}
          className="p-2 hover:bg-gray-200 rounded text-gray-700 text-sm"
          title="Numbered List"
        >
          1.
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <label className="p-2 hover:bg-gray-200 rounded text-gray-700 cursor-pointer flex items-center gap-1" title="Upload Image">
          <Image className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Upload</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        <span className="text-xs text-gray-400 ml-2 hidden lg:inline">Drag & drop images or paste from clipboard</span>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onPaste={handlePaste}
        onInput={handleInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="min-h-[400px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{ 
          fontFamily: 'inherit',
          lineHeight: '1.7',
        }}
        data-placeholder="Start writing your article here..."
        suppressContentEditableWarning
      />
    </div>
  );
}

export default function NewArticlePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [readTime, setReadTime] = useState('5 min read');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Only allow access if authenticated (this should be the owner)
  // In a real app, you'd check if user.email matches the admin email

  const handleSave = async () => {
    if (!title || !excerpt || !selectedPillar || !content) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    // In a real implementation, this would save to the backend
    // For now, we'll just show a success message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Article saved successfully! In production, this would be saved to the database.');
    setSaving(false);
    navigate('/articles');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logoImage} alt="A Wealthy Foundation" className="h-10 w-auto" />
              <div>
                <h1 className="text-lg font-serif font-bold text-navy-900">A Wealthy Foundation</h1>
                <p className="text-xs text-copper-600 tracking-wider uppercase hidden sm:block">DESIGN THE LIFE YOU WANT. BUILD THE FINANCIAL HOUSE TO SUPPORT IT.</p>
              </div>
            </div>
            <nav className="hidden lg:flex items-center space-x-4">
              {NAV_ITEMS.map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => navigate(item.href)} 
                  className="text-sm font-medium text-navy-700 hover:text-copper-600"
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => navigate(isAuthenticated ? '/my-foundation' : '/login')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-navy-900 text-white text-sm font-semibold rounded hover:bg-navy-800 transition-colors"
              >
                <User className="w-4 h-4" />
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </button>
            </nav>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1 text-navy-700">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Create New Article</h1>
              <p className="text-gray-600 text-sm mt-1">Write and publish a new article for your readers.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-copper-600 text-white font-semibold rounded-lg hover:bg-copper-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Publish Article'}
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:border-copper-500"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a brief summary that will appear in article previews..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-copper-500"
              />
            </div>

            {/* Pillar Selection */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                Related Pillar <span className="text-red-500">*</span>
              </label>
              <p className="text-gray-500 text-sm mb-3">
                Select which financial pillar this article relates to. It will be automatically categorized.
              </p>
              <div className="flex flex-wrap gap-2">
                {PILLARS.map((pillar) => {
                  const Icon = PILLAR_ICONS[pillar.id];
                  const isSelected = selectedPillar === pillar.id;
                  return (
                    <button
                      key={pillar.id}
                      type="button"
                      onClick={() => setSelectedPillar(pillar.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? `${pillar.color} border-current` 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {pillar.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Read Time */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                Estimated Read Time
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="5 min read"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-copper-500"
                />
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Approximately {Math.ceil((content.replace(/<[^>]*>/g, '').split(/\s+/).length) / 200)} min read</span>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-2">
                Article Content <span className="text-red-500">*</span>
              </label>
              <p className="text-gray-500 text-sm mb-3">
                Write your article content below. You can paste text, images, and formatted content directly.
              </p>
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            {/* Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-navy-900 mb-2">Writing Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use clear headings to organize your content</li>
                <li>• Include practical examples and actionable advice</li>
                <li>• Paste images directly or drag & drop them into the editor</li>
                <li>• Keep paragraphs short for better readability</li>
                <li>• End with a clear call-to-action or key takeaway</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <h3 className="font-serif font-bold text-base">A Wealthy Foundation</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-navy-300">
              <button onClick={() => navigate('/articles')} className="hover:text-copper-400">Articles</button>
              <button onClick={() => navigate('/#tools')} className="hover:text-copper-400">Tools</button>
              <button onClick={() => navigate('/#pillars')} className="hover:text-copper-400">Building Blocks</button>
              <button onClick={() => navigate('/#books')} className="hover:text-copper-400">Books</button>
              <button onClick={() => navigate('/#about')} className="hover:text-copper-400">About</button>
              <button onClick={() => navigate('/#contact')} className="hover:text-copper-400">Contact</button>
            </div>
            <p className="text-navy-400 w-full text-center pt-2 border-t border-navy-800 text-sm">© {new Date().getFullYear()} A Wealthy Foundation</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
