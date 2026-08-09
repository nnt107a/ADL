import { useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { resolveHtmlContent, resolveImageUrl } from '../utils/imageUrl';

const FONT_FAMILIES = [
  { label: 'Aptos (Body)', value: 'Aptos, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];

const TEXT_COLORS = [
  { label: 'Auto (Default)', value: '' },
  { label: 'Black', value: '#111827' },
  { label: 'Navy', value: '#0c2839' },
  { label: 'Accent Gold', value: '#d97706' },
  { label: 'Deep Crimson', value: '#991b1b' },
  { label: 'Forest Green', value: '#065f46' },
  { label: 'Slate Gray', value: '#4b5563' },
  { label: 'Royal Blue', value: '#1d4ed8' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None', value: '' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Cyan', value: '#a5f3fc' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Orange', value: '#fed7aa' },
];

const SYMBOLS = ['©', '®', '™', '§', '¶', '•', '—', '–', '→', '←', '↑', '↓', '★', '✓', '✕', '€', '£', '¥', '°', '±', '≠', '≤', '≥'];

// Image NodeView Component with interactive resizing & floating alignment toolbar
function ImageNodeView({ node, updateAttributes, selected }) {
  const [resizing, setResizing] = useState(false);
  const align = node.attrs.align || 'center';
  const width = node.attrs.width || '100%';
  const resolvedSrc = resolveImageUrl(node.attrs.src);

  const wrapperStyle = {
    display: 'flex',
    justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
    margin: '1rem 0',
    width: '100%',
    userSelect: 'none',
  };

  const imgContainerStyle = {
    position: 'relative',
    display: 'inline-block',
    width: width,
    maxWidth: '100%',
  };

  const imgStyle = {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '12px',
    border: selected ? '2px solid var(--accent-strong)' : '1px solid rgba(12, 40, 57, 0.1)',
    boxShadow: selected ? '0 0 0 4px rgba(255, 189, 89, 0.35)' : '0 4px 14px rgba(0, 0, 0, 0.06)',
    transition: resizing ? 'none' : 'all 0.2s ease',
  };

  function handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    const startX = e.clientX;
    const startWidth = e.currentTarget.parentElement.getBoundingClientRect().width;

    function onMouseMove(moveEvt) {
      const deltaX = moveEvt.clientX - startX;
      const newWidth = Math.max(120, startWidth + deltaX);
      updateAttributes({ width: `${Math.round(newWidth)}px` });
    }

    function onMouseUp() {
      setResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  return (
    <NodeViewWrapper style={wrapperStyle} data-align={align}>
      <div style={imgContainerStyle}>
        <img src={resolvedSrc} alt={node.attrs.alt || ''} style={imgStyle} />

        {selected && (
          <div className="image-node-toolbar" onMouseDown={(e) => e.stopPropagation()}>
            <div className="image-toolbar-group">
              <span className="image-toolbar-label">Align:</span>
              <button
                type="button"
                className={`image-toolbar-btn ${align === 'left' ? 'is-active' : ''}`}
                onClick={() => updateAttributes({ align: 'left' })}
              >
                Left
              </button>
              <button
                type="button"
                className={`image-toolbar-btn ${align === 'center' ? 'is-active' : ''}`}
                onClick={() => updateAttributes({ align: 'center' })}
              >
                Center
              </button>
              <button
                type="button"
                className={`image-toolbar-btn ${align === 'right' ? 'is-active' : ''}`}
                onClick={() => updateAttributes({ align: 'right' })}
              >
                Right
              </button>
            </div>

            <div className="image-toolbar-divider" />

            <div className="image-toolbar-group">
              <span className="image-toolbar-label">Size:</span>
              <button
                type="button"
                className={`image-toolbar-btn ${width === '25%' ? 'is-active' : ''}`}
                onClick={() => updateAttributes({ width: '25%' })}
              >
                25%
              </button>
              <button
                type="button"
                className={`image-toolbar-btn ${width === '50%' ? 'is-active' : ''}`}
                onClick={() => updateAttributes({ width: '50%' })}
              >
                50%
              </button>
              <button
                type="button"
                className={`image-toolbar-btn ${width === '75%' ? 'is-active' : ''}`}
                onClick={() => updateAttributes({ width: '75%' })}
              >
                75%
              </button>
              <button
                type="button"
                className={`image-toolbar-btn ${width === '100%' ? 'is-active' : ''}`}
                onClick={() => updateAttributes({ width: '100%' })}
              >
                100%
              </button>
            </div>
          </div>
        )}

        {selected && (
          <div
            className="image-resize-handle"
            onMouseDown={handleMouseDown}
            title="Drag to resize image"
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}

// Custom Tiptap Resizable Image extension
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => ({
          style: attributes.width ? `width: ${attributes.width}; max-width: 100%;` : '',
        }),
      },
      align: {
        default: 'center',
        renderHTML: (attributes) => {
          const align = attributes.align || 'center';
          let marginStyle = 'margin-left: auto; margin-right: auto;';
          if (align === 'left') {
            marginStyle = 'margin-right: auto; margin-left: 0;';
          } else if (align === 'right') {
            marginStyle = 'margin-left: auto; margin-right: 0;';
          }
          return {
            'data-align': align,
            style: `display: block; ${marginStyle}`,
          };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

// Extension to preserve text alignment on new line (Enter key)
const PersistentTextAlign = Extension.create({
  name: 'persistentTextAlign',
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;
        let currentAlign = null;

        for (let d = $from.depth; d >= 0; d--) {
          const node = $from.node(d);
          if (node?.attrs?.textAlign) {
            currentAlign = node.attrs.textAlign;
            break;
          }
        }

        const handled = editor.commands.splitBlock();
        if (handled && currentAlign && currentAlign !== 'left') {
          setTimeout(() => {
            editor.commands.setTextAlign(currentAlign);
          }, 0);
        }
        return handled;
      },
    };
  },
});

// Extension to support paragraph/block-level indents
const CustomIndent = Extension.create({
  name: 'customIndent',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote', 'listItem'],
        attributes: {
          indent: {
            default: null,
            parseHTML: (element) => element.style.marginLeft || null,
            renderHTML: (attributes) => {
              if (!attributes.indent || attributes.indent === '0rem' || attributes.indent === '0px') return {};
              return {
                style: `margin-left: ${attributes.indent};`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setIndent: (indentValue) => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { from, to } = selection;
        let modified = false;

        tr.doc.nodesBetween(from, to, (node, pos) => {
          if (['paragraph', 'heading', 'blockquote', 'listItem'].includes(node.type.name)) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              indent: indentValue,
            });
            modified = true;
          }
        });

        if (!modified && state.selection.$from) {
          for (let d = state.selection.$from.depth; d >= 0; d--) {
            const parentNode = state.selection.$from.node(d);
            if (['paragraph', 'heading', 'blockquote', 'listItem'].includes(parentNode.type.name)) {
              const parentPos = state.selection.$from.before(d);
              tr.setNodeMarkup(parentPos, undefined, {
                ...parentNode.attrs,
                indent: indentValue,
              });
              modified = true;
              break;
            }
          }
        }

        if (modified && dispatch) {
          dispatch(tr);
        }
        return true;
      },
    };
  },
});

// Horizontal Ruler Component for MS Word alignment & indent control
function WordHorizontalRuler({ editor, indentLeft, setIndentLeft, indentRight, setIndentRight, headerOffset, isParentFixed }) {
  const scaleRef = useRef(null);
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function sync() {
      const rect = el.getBoundingClientRect();
      setContainerRect({ left: rect.left, width: rect.width, top: rect.top });
    }

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);
  const currentAlign = editor?.isActive({ textAlign: 'center' })
    ? 'center'
    : editor?.isActive({ textAlign: 'right' })
    ? 'right'
    : editor?.isActive({ textAlign: 'justify' })
    ? 'justify'
    : 'left';

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  useEffect(() => {
    if (!editor) return;
    function updateActiveIndent() {
      const { selection } = editor.state;
      const { $from } = selection;
      let activeIndent = '0rem';
      for (let d = $from.depth; d >= 0; d--) {
        const node = $from.node(d);
        if (node?.attrs?.indent) {
          activeIndent = node.attrs.indent;
          break;
        }
      }
      setIndentLeft(activeIndent);
    }
    editor.on('selectionUpdate', updateActiveIndent);
    return () => {
      editor.off('selectionUpdate', updateActiveIndent);
    };
  }, [editor, setIndentLeft]);

  function applyNodeIndent(val) {
    setIndentLeft(val);
    if (editor?.commands?.setIndent) {
      editor.commands.setIndent(val);
    }
  }

  function handleIncreaseIndent() {
    const num = parseFloat(indentLeft) || 0;
    const newRem = `${Math.min(num + 0.75, 4.5)}rem`;
    applyNodeIndent(newRem);
  }

  function handleDecreaseIndent() {
    const num = parseFloat(indentLeft) || 0;
    const newRem = `${Math.max(num - 0.75, 0)}rem`;
    applyNodeIndent(newRem);
  }

  function handleResetIndent() {
    applyNodeIndent('0rem');
    setIndentRight('0rem');
  }

  function handleMouseDownLeft(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!scaleRef.current) return;

    const scaleRect = scaleRef.current.getBoundingClientRect();

    function onMouseMove(moveEvt) {
      const offsetX = moveEvt.clientX - scaleRect.left;
      const ratio = Math.max(0, Math.min(offsetX / scaleRect.width, 0.45));
      const remVal = `${(ratio * 10).toFixed(2)}rem`;
      applyNodeIndent(remVal);
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function handleMouseDownRight(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!scaleRef.current) return;

    const scaleRect = scaleRef.current.getBoundingClientRect();

    function onMouseMove(moveEvt) {
      const offsetX = scaleRect.right - moveEvt.clientX;
      const ratio = Math.max(0, Math.min(offsetX / scaleRect.width, 0.45));
      const remVal = `${(ratio * 10).toFixed(2)}rem`;
      setIndentRight(remVal);
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function handleUnitClick(index) {
    const remVal = `${((index / 17) * 4.5).toFixed(2)}rem`;
    applyNodeIndent(remVal);
  }

  const rulerFixed = containerRect != null && containerRect.top <= headerOffset && isParentFixed;
  const rulerStyle = rulerFixed
    ? {
        position: 'fixed',
        top: `${headerOffset}px`,
        left: `${containerRect.left}px`,
        width: `${containerRect.width}px`,
        zIndex: 110,
        borderRadius: '10px',
      }
    : {};

  return (
    <>
      {rulerFixed && <div style={{ height: containerRef.current?.offsetHeight || 60, marginBottom: '0.85rem' }} />}
      <div className="word-ruler-container" ref={containerRef} style={rulerStyle}>
      <div className="word-ruler-toolbar">
        <div className="ruler-actions-left">
          <span className="ruler-label">📐 RULER & INDENT</span>
          <button
            type="button"
            className="ruler-btn"
            title="Decrease Left Indent"
            onClick={handleDecreaseIndent}
          >
            ⇤ Outdent
          </button>
          <button
            type="button"
            className="ruler-btn"
            title="Increase Left Indent"
            onClick={handleIncreaseIndent}
          >
            ⇥ Indent
          </button>
          <button
            type="button"
            className="ruler-btn"
            title="Reset Indents"
            onClick={handleResetIndent}
          >
            ↺ Reset
          </button>
        </div>

        <div className="ruler-actions-right">
          <span className="ruler-label">ALIGN:</span>
          <button
            type="button"
            className={`ruler-btn-align ${currentAlign === 'left' ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            title="Align Left"
          >
            ⇐ Left
          </button>
          <button
            type="button"
            className={`ruler-btn-align ${currentAlign === 'center' ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            title="Align Center"
          >
            ⇔ Center
          </button>
          <button
            type="button"
            className={`ruler-btn-align ${currentAlign === 'right' ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            title="Align Right"
          >
            ⇒ Right
          </button>
          <button
            type="button"
            className={`ruler-btn-align ${currentAlign === 'justify' ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
            title="Justify"
          >
            ≡ Justify
          </button>
        </div>
      </div>

      <div className="word-ruler-track">
        <div className="ruler-margin-left" />
        <div className="ruler-active-scale" ref={scaleRef}>
          {numbers.map((n, idx) => (
            <div
              key={n}
              className="ruler-unit"
              onClick={() => handleUnitClick(idx)}
              title={`Click to set left indent at ${n}`}
            >
              <span className="ruler-number">{n}</span>
              <span className="ruler-tick-major" />
              <span className="ruler-tick-sub" />
            </div>
          ))}

          <div
            className="ruler-indent-handle handle-left"
            style={{ left: indentLeft }}
            onMouseDown={handleMouseDownLeft}
            title={`Drag left triangle handle to adjust left indent (${indentLeft})`}
          >
            ▲
          </div>
          <div
            className="ruler-indent-handle handle-right"
            style={{ right: indentRight }}
            onMouseDown={handleMouseDownRight}
            title={`Drag right triangle handle to adjust right indent (${indentRight})`}
          >
            ▲
          </div>
        </div>
        <div className="ruler-margin-right" />
      </div>
    </div>
    </>
  );
}

export default function WordRibbonEditor({ content, onChange, onUploadImage, placeholder = 'Start typing your article here...' }) {
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState('editor'); // 'editor', 'split', 'reading'
  const [themeStyle, setThemeStyle] = useState('corporate'); // 'corporate', 'editorial', 'modern'
  const [canvasWidth, setCanvasWidth] = useState('standard'); // 'standard', 'wide', 'full'
  const [lineSpacing, setLineSpacing] = useState('normal'); // 'normal', 'compact', 'relaxed'
  const [indentLeft, setIndentLeft] = useState('0rem');
  const [indentRight, setIndentRight] = useState('0rem');
  const [previewDark, setPreviewDark] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [, setTick] = useState(0);

  // Fixed-position ribbon tracking
  const shellRef = useRef(null);
  const ribbonRef = useRef(null);
  const [shellRect, setShellRect] = useState(null);
  const [ribbonHeight, setRibbonHeight] = useState(0);

  useEffect(() => {
    const shell = shellRef.current;
    const ribbon = ribbonRef.current;
    if (!shell) return;

    function sync() {
      const rect = shell.getBoundingClientRect();
      const rawHeight = getComputedStyle(document.documentElement).getPropertyValue('--header-stack-height').trim();
      const headerPx = rawHeight ? parseFloat(rawHeight) : 130;
      setShellRect({ left: rect.left, width: rect.width, top: rect.top, headerPx });
      if (ribbonRef.current) setRibbonHeight(ribbonRef.current.offsetHeight);
    }

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(shell);
    if (ribbon) ro.observe(ribbon);
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      ResizableImage.configure({ inline: false, allowBase64: true }),
      Link.configure({ autolink: true, openOnClick: false, protocols: ['http', 'https', 'mailto'] }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph', 'blockquote', 'bulletList', 'orderedList', 'listItem'] }),
      PersistentTextAlign,
      CustomIndent,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'word-paper-canvas',
        placeholder,
      },
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith('image/'));

        if (imageItem && onUploadImage) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            onUploadImage(file)
              .then((url) => {
                if (url) {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src: resolveImageUrl(url) })
                    )
                  );
                }
              })
              .catch((err) => console.error('Failed to auto-upload pasted image:', err));
            return true;
          }
        }
        return false;
      },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFile = files.find((file) => file.type.startsWith('image/'));

        if (imageFile && onUploadImage) {
          event.preventDefault();
          onUploadImage(imageFile)
            .then((url) => {
              if (url) {
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                view.dispatch(
                  view.state.tr.insert(
                    coordinates ? coordinates.pos : view.state.selection.from,
                    view.state.schema.nodes.image.create({ src: resolveImageUrl(url) })
                  )
                );
              }
            })
            .catch((err) => console.error('Failed to auto-upload dropped image:', err));
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return undefined;

    function handleStateChange() {
      setTick((t) => t + 1);
    }

    editor.on('transaction', handleStateChange);
    editor.on('selectionUpdate', handleStateChange);
    editor.on('focus', handleStateChange);

    return () => {
      editor.off('transaction', handleStateChange);
      editor.off('selectionUpdate', handleStateChange);
      editor.off('focus', handleStateChange);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    // Only update internal editor content if the user is NOT actively typing inside it
    if (!editor.isFocused && content !== undefined && content !== editor.getHTML()) {
      queueMicrotask(() => {
        if (!editor.isDestroyed && content !== undefined && content !== editor.getHTML()) {
          editor.commands.setContent(content || '', false);
        }
      });
    }
  }, [content, editor]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!editor) return { words: 0, characters: 0, readingTime: 1 };
    const text = editor.getText().trim();
    const words = text ? text.split(/\s+/).length : 0;
    const characters = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, characters, readingTime };
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  function handleAlign(align) {
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { align }).run();
    } else {
      editor.chain().focus().setTextAlign(align).run();
    }
  }

  function handleSetLink() {
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter link URL:', previousUrl);
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url.trim() }).run();
  }

  function handleInsertImagePrompt() {
    const url = window.prompt('Enter image URL:');
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: resolveImageUrl(url.trim()) }).run();
    }
  }

  function handleUploadImageClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file && onUploadImage) {
        try {
          const url = await onUploadImage(file);
          if (url) {
            editor.chain().focus().setImage({ src: resolveImageUrl(url) }).run();
          }
        } catch (err) {
          alert(`Image upload failed: ${err.message}`);
        }
      }
    };
    input.click();
  }

  function handleFontSizeChange(size) {
    if (!size) {
      editor.chain().focus().unsetMark('textStyle').run();
      return;
    }
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
  }

  function handleInsertSymbol(sym) {
    editor.chain().focus().insertContent(sym).run();
  }

  // Compute whether ribbon should be fixed (shell is partially or fully above viewport)
  const headerStackHeight = shellRect?.headerPx ?? 130;
  const ribbonFixed = shellRect != null && shellRect.top <= headerStackHeight;

  const ribbonStyle = ribbonFixed
    ? {
        position: 'fixed',
        top: `${headerStackHeight}px`,
        left: `${shellRect.left}px`,
        width: `${shellRect.width}px`,
        zIndex: 120,
        borderRadius: '18px 18px 0 0',
      }
    : {};

  return (
    <div className="word-editor-shell" ref={shellRef}>
      {/* Top MS Word Ribbon Bar Header */}
      {/* Spacer so content below ribbon isn't hidden under fixed bar */}
      {ribbonFixed && <div style={{ height: ribbonHeight, flexShrink: 0 }} />}
      <div className="word-ribbon-bar" ref={ribbonRef} style={ribbonStyle}>
        {/* Ribbon Main Menu Tabs */}
        <div className="word-ribbon-tabs" role="tablist">
          <button
            type="button"
            className={`ribbon-tab ${activeTab === 'home' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            type="button"
            className={`ribbon-tab ${activeTab === 'insert' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('insert')}
          >
            Insert
          </button>
          <button
            type="button"
            className={`ribbon-tab ${activeTab === 'layout' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('layout')}
          >
            Layout & Design
          </button>
          <button
            type="button"
            className={`ribbon-tab ${activeTab === 'view' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            View
          </button>

          <div className="word-ribbon-right-controls">
            <span className="word-doc-status">
              📝 {stats.words} words • {stats.readingTime} min read
            </span>
          </div>
        </div>

        {/* Ribbon Context Toolbar Panels */}
        <div className="word-ribbon-content">
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="ribbon-panel-row">
              {/* Clipboard Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-buttons">
                  <button
                    type="button"
                    className="ribbon-btn"
                    title="Paste from clipboard"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) editor.chain().focus().insertContent(text).run();
                      } catch {
                        const text = window.prompt('Paste your text here:');
                        if (text) editor.chain().focus().insertContent(text).run();
                      }
                    }}
                  >
                    📋 <span className="btn-label">Paste</span>
                  </button>
                  <button
                    type="button"
                    className="ribbon-btn"
                    title="Copy selected text"
                    onClick={() => document.execCommand('copy')}
                  >
                    ✂️ <span className="btn-label">Copy</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Clipboard</div>
              </div>

              <div className="ribbon-divider" />

              {/* Font Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <select
                    className="ribbon-select font-family-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        editor.chain().focus().setFontFamily(e.target.value).run();
                      } else {
                        editor.chain().focus().unsetFontFamily().run();
                      }
                    }}
                  >
                    <option value="">Font Family</option>
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>

                  <select
                    className="ribbon-select font-size-select"
                    onChange={(e) => handleFontSizeChange(e.target.value)}
                  >
                    <option value="">Size</option>
                    {FONT_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('bold') ? 'is-active' : ''}`}
                    title="Bold (Ctrl+B)"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('italic') ? 'is-active' : ''}`}
                    title="Italic (Ctrl+I)"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('underline') ? 'is-active' : ''}`}
                    title="Underline (Ctrl+U)"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                  >
                    <u>U</u>
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('strike') ? 'is-active' : ''}`}
                    title="Strikethrough"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                  >
                    <s>ab</s>
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('subscript') ? 'is-active' : ''}`}
                    title="Subscript"
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                  >
                    X₂
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('superscript') ? 'is-active' : ''}`}
                    title="Superscript"
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                  >
                    X²
                  </button>

                  <label className="ribbon-color-picker" title="Text Highlight Color">
                    <span>🖌️</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          editor.chain().focus().setHighlight({ color: e.target.value }).run();
                        } else {
                          editor.chain().focus().unsetHighlight().run();
                        }
                      }}
                    >
                      {HIGHLIGHT_COLORS.map((c) => (
                        <option key={c.label} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="ribbon-color-picker" title="Font Color">
                    <span>🎨</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          editor.chain().focus().setColor(e.target.value).run();
                        } else {
                          editor.chain().focus().unsetColor().run();
                        }
                      }}
                    >
                      {TEXT_COLORS.map((c) => (
                        <option key={c.label} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="ribbon-btn-icon"
                    title="Clear Formatting"
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                  >
                    🧹
                  </button>
                </div>
                <div className="ribbon-group-label">Font & Typography</div>
              </div>

              <div className="ribbon-divider" />

              {/* Paragraph Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                    title="Bullet List"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                    title="Numbered List"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  >
                    1. List
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('taskList') ? 'is-active' : ''}`}
                    title="Checklist"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                  >
                    ☑️ Task
                  </button>
                </div>

                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive({ textAlign: 'left' }) || (editor.isActive('image') && editor.getAttributes('image').align === 'left') ? 'is-active' : ''}`}
                    title="Align Left"
                    onClick={() => handleAlign('left')}
                  >
                    ⇐ Left
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive({ textAlign: 'center' }) || (editor.isActive('image') && editor.getAttributes('image').align === 'center') ? 'is-active' : ''}`}
                    title="Align Center"
                    onClick={() => handleAlign('center')}
                  >
                    ⇔ Center
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive({ textAlign: 'right' }) || (editor.isActive('image') && editor.getAttributes('image').align === 'right') ? 'is-active' : ''}`}
                    title="Align Right"
                    onClick={() => handleAlign('right')}
                  >
                    ⇒ Right
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
                    title="Justify"
                    onClick={() => handleAlign('justify')}
                  >
                    ≡ Justify
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn-icon ${editor.isActive('blockquote') ? 'is-active' : ''}`}
                    title="Quote Block"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    “ Quote
                  </button>
                </div>
                <div className="ribbon-group-label">Paragraph & Alignment</div>
              </div>

              <div className="ribbon-divider" />

              {/* Styles Group */}
              <div className="ribbon-group">
                <div className="ribbon-styles-gallery">
                  <button
                    type="button"
                    className={`ribbon-style-card ${editor.isActive('paragraph') ? 'is-active' : ''}`}
                    onClick={() => editor.chain().focus().setParagraph().run()}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    className={`ribbon-style-card ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  >
                    Heading 1
                  </button>
                  <button
                    type="button"
                    className={`ribbon-style-card ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    Heading 2
                  </button>
                  <button
                    type="button"
                    className={`ribbon-style-card ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  >
                    Heading 3
                  </button>
                </div>
                <div className="ribbon-group-label">Styles</div>
              </div>

              <div className="ribbon-divider" />

              {/* Editing Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className="ribbon-btn-icon"
                    title="Undo"
                    onClick={() => editor.chain().focus().undo().run()}
                  >
                    ↩️ Undo
                  </button>
                  <button
                    type="button"
                    className="ribbon-btn-icon"
                    title="Redo"
                    onClick={() => editor.chain().focus().redo().run()}
                  >
                    ↪️ Redo
                  </button>
                </div>
                <div className="ribbon-group-label">History</div>
              </div>
            </div>
          )}

          {/* INSERT TAB */}
          {activeTab === 'insert' && (
            <div className="ribbon-panel-row">
              {/* Media Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button type="button" className="ribbon-btn" onClick={handleUploadImageClick}>
                    🖼️ Upload Image
                  </button>
                  <button type="button" className="ribbon-btn" onClick={handleInsertImagePrompt}>
                    🌐 Image URL
                  </button>
                </div>
                <div className="ribbon-group-label">Media & Images</div>
              </div>

              <div className="ribbon-divider" />

              {/* Tables Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className="ribbon-btn"
                    onClick={() =>
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    }
                  >
                    📊 3x3 Table
                  </button>
                  {editor.isActive('table') && (
                    <>
                      <button
                        type="button"
                        className="ribbon-btn-icon"
                        title="Add Row Below"
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                      >
                        + Row
                      </button>
                      <button
                        type="button"
                        className="ribbon-btn-icon"
                        title="Add Column Right"
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                      >
                        + Col
                      </button>
                      <button
                        type="button"
                        className="ribbon-btn-icon"
                        title="Delete Table"
                        onClick={() => editor.chain().focus().deleteTable().run()}
                      >
                        🗑️ Table
                      </button>
                    </>
                  )}
                </div>
                <div className="ribbon-group-label">Tables & Data</div>
              </div>

              <div className="ribbon-divider" />

              {/* Links & Elements Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className={`ribbon-btn ${editor.isActive('link') ? 'is-active' : ''}`}
                    onClick={handleSetLink}
                  >
                    🔗 {editor.isActive('link') ? 'Edit Link' : 'Add Link'}
                  </button>
                  <button
                    type="button"
                    className="ribbon-btn"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  >
                    ➖ Divider Line
                  </button>
                  <button
                    type="button"
                    className="ribbon-btn"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  >
                    💻 Code Block
                  </button>
                </div>
                <div className="ribbon-group-label">Links & Blocks</div>
              </div>

              <div className="ribbon-divider" />

              {/* Special Symbols */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className="ribbon-btn"
                    onClick={() => setShowSymbols((prev) => !prev)}
                  >
                    Ω Special Symbols
                  </button>
                </div>
                {showSymbols && (
                  <div className="symbols-dropdown-grid">
                    {SYMBOLS.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        className="symbol-chip"
                        onClick={() => handleInsertSymbol(sym)}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                )}
                <div className="ribbon-group-label">Symbols</div>
              </div>
            </div>
          )}

          {/* LAYOUT & DESIGN TAB */}
          {activeTab === 'layout' && (
            <div className="ribbon-panel-row">
              {/* Document Theme */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className={`ribbon-btn ${themeStyle === 'corporate' ? 'is-active' : ''}`}
                    onClick={() => setThemeStyle('corporate')}
                  >
                    🏛️ Corporate
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn ${themeStyle === 'editorial' ? 'is-active' : ''}`}
                    onClick={() => setThemeStyle('editorial')}
                  >
                    📰 Editorial
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn ${themeStyle === 'modern' ? 'is-active' : ''}`}
                    onClick={() => setThemeStyle('modern')}
                  >
                    ⚡ Modern
                  </button>
                </div>
                <div className="ribbon-group-label">Typography Style</div>
              </div>

              <div className="ribbon-divider" />

              {/* Margins / Width */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className={`ribbon-btn ${canvasWidth === 'standard' ? 'is-active' : ''}`}
                    onClick={() => setCanvasWidth('standard')}
                  >
                    Standard (A4)
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn ${canvasWidth === 'wide' ? 'is-active' : ''}`}
                    onClick={() => setCanvasWidth('wide')}
                  >
                    Wide Margin
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn ${canvasWidth === 'full' ? 'is-active' : ''}`}
                    onClick={() => setCanvasWidth('full')}
                  >
                    Full Width
                  </button>
                </div>
                <div className="ribbon-group-label">Page Margins</div>
              </div>

              <div className="ribbon-divider" />

              {/* Line Spacing */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className={`ribbon-btn ${lineSpacing === 'compact' ? 'is-active' : ''}`}
                    onClick={() => setLineSpacing('compact')}
                  >
                    Compact (1.3)
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn ${lineSpacing === 'normal' ? 'is-active' : ''}`}
                    onClick={() => setLineSpacing('normal')}
                  >
                    Normal (1.6)
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn ${lineSpacing === 'relaxed' ? 'is-active' : ''}`}
                    onClick={() => setLineSpacing('relaxed')}
                  >
                    Relaxed (1.9)
                  </button>
                </div>
                <div className="ribbon-group-label">Line Spacing</div>
              </div>
            </div>
          )}

          {/* VIEW TAB */}
          {activeTab === 'view' && (
            <div className="ribbon-panel-row">
              {/* View Modes */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className={`ribbon-btn ${viewMode === 'editor' ? 'is-active' : ''}`}
                    onClick={() => setViewMode('editor')}
                  >
                    📄 Editor Canvas
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn ${viewMode === 'split' ? 'is-active' : ''}`}
                    onClick={() => setViewMode('split')}
                  >
                    📖 Split Live Preview
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn ${viewMode === 'reading' ? 'is-active' : ''}`}
                    onClick={() => setViewMode('reading')}
                  >
                    👁️ Full Reader Mode
                  </button>
                </div>
                <div className="ribbon-group-label">Display Mode</div>
              </div>

              <div className="ribbon-divider" />

              {/* Preview Theme */}
              <div className="ribbon-group">
                <div className="ribbon-group-row">
                  <button
                    type="button"
                    className={`ribbon-btn ${!previewDark ? 'is-active' : ''}`}
                    onClick={() => setPreviewDark(false)}
                  >
                    ☀️ Light Theme
                  </button>
                  <button
                    type="button"
                    className={`ribbon-btn ${previewDark ? 'is-active' : ''}`}
                    onClick={() => setPreviewDark(true)}
                  >
                    🌙 Dark Theme
                  </button>
                </div>
                <div className="ribbon-group-label">Background Preview</div>
              </div>

              <div className="ribbon-divider" />

              {/* Document Statistics */}
              <div className="ribbon-group">
                <div style={{ fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 600, display: 'grid', gap: '0.2rem' }}>
                  <div>Words: <strong>{stats.words}</strong></div>
                  <div>Characters: <strong>{stats.characters}</strong></div>
                  <div>Reading time: <strong>~{stats.readingTime} min</strong></div>
                </div>
                <div className="ribbon-group-label">Document Stats</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor & Preview Workspace Container */}
      <div
        className={`word-workspace theme-${themeStyle} width-${canvasWidth} spacing-${lineSpacing} ${
          previewDark ? 'mode-dark' : ''
        }`}
      >
        {/* Editor Canvas View */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="word-paper-wrapper">
            <WordHorizontalRuler
              editor={editor}
              indentLeft={indentLeft}
              setIndentLeft={setIndentLeft}
              indentRight={indentRight}
              setIndentRight={setIndentRight}
              headerOffset={headerStackHeight + (ribbonFixed ? ribbonHeight : 0)}
              isParentFixed={ribbonFixed}
            />
            <div className="rich-editor pro-rich-editor word-prose-container">
              <EditorContent editor={editor} />
            </div>
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'reading' || viewMode === 'split') && (
          <div className="word-preview-wrapper">
            <div className="content-card admin-editor-preview">
              <p className="content-label">Full Article Live Preview</p>
              <div
                className="news-content"
                dangerouslySetInnerHTML={{ __html: resolveHtmlContent(editor.getHTML()) }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
