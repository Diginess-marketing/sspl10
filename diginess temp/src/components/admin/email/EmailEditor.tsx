import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link2, Unlink, ImagePlus, Minus, Undo2, Redo2, Quote,
} from 'lucide-react';

// Brand colours offered in the toolbar (email-safe hex values)
const COLORS = [
  { label: 'Default', value: '' },
  { label: 'Navy', value: '#0a1240' },
  { label: 'Blue', value: '#1f57d6' },
  { label: 'Green', value: '#2f7d32' },
  { label: 'Gold', value: '#8a6a1f' },
  { label: 'Red', value: '#c62828' },
];

interface EmailEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** {{placeholder}} names with descriptions, offered in "Insert field" */
  placeholders?: Record<string, string>;
  ariaLabel?: string;
}

const ToolButton = ({ label, active, disabled, onClick, children }: {
  label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) => (
  <button
    type="button"
    className="email-editor__tool"
    data-active={active || undefined}
    aria-label={label}
    aria-pressed={active}
    title={label}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()} // keep the editor selection
    onClick={onClick}
  >
    {children}
  </button>
);

function setLink(editor: Editor) {
  const previous = editor.getAttributes('link').href as string | undefined;
  const url = window.prompt('Link address (https://…)', previous || 'https://');
  if (url === null) return;
  if (!url.trim() || url.trim() === 'https://') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
}

function addImage(editor: Editor) {
  const url = window.prompt('Image address (https://…). Use a public image URL; email clients block uploads.', 'https://');
  if (url && /^https?:\/\/\S+$/.test(url.trim())) editor.chain().focus().setImage({ src: url.trim() }).run();
}

/** WYSIWYG editor that produces email-friendly HTML. */
export const EmailEditor = ({ value, onChange, placeholders = {}, ariaLabel = 'Email body' }: EmailEditorProps) => {
  const editor = useEditor({
    // Tiptap 3 no longer re-renders on every change; the toolbar's active states need it
    shouldRerenderOnTransaction: true,
    extensions: [
      // Tiptap 3: StarterKit includes Underline and Link
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Image.configure({ HTMLAttributes: { style: 'max-width:100%;height:auto;' } }),
      Placeholder.configure({ placeholder: 'Write the email…' }),
    ],
    content: value,
    editorProps: { attributes: { class: 'email-editor__content', 'aria-label': ariaLabel, role: 'textbox', 'aria-multiline': 'true' } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  // Load new content when a different template is opened
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(editor.isEmpty && !value)) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return <div className="email-editor email-editor--loading" aria-busy="true" />;

  const currentColor = (editor.getAttributes('textStyle').color as string | undefined) || '';

  return (
    <div className="email-editor">
      <div className="email-editor__toolbar" role="toolbar" aria-label="Formatting">
        <ToolButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></ToolButton>
        <ToolButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></ToolButton>
        <ToolButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon /></ToolButton>
        <ToolButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough /></ToolButton>
        <span className="email-editor__sep" aria-hidden="true" />
        <ToolButton label="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolButton>
        <ToolButton label="Subheading" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></ToolButton>
        <ToolButton label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></ToolButton>
        <ToolButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolButton>
        <ToolButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></ToolButton>
        <span className="email-editor__sep" aria-hidden="true" />
        <ToolButton label="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft /></ToolButton>
        <ToolButton label="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter /></ToolButton>
        <ToolButton label="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight /></ToolButton>
        <span className="email-editor__sep" aria-hidden="true" />
        <ToolButton label="Add link" active={editor.isActive('link')} onClick={() => setLink(editor)}><Link2 /></ToolButton>
        <ToolButton label="Remove link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}><Unlink /></ToolButton>
        <ToolButton label="Insert image" onClick={() => addImage(editor)}><ImagePlus /></ToolButton>
        <ToolButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus /></ToolButton>
        <span className="email-editor__sep" aria-hidden="true" />
        <select
          className="email-editor__select"
          aria-label="Text colour"
          value={currentColor}
          onChange={(e) => (e.target.value ? editor.chain().focus().setColor(e.target.value).run() : editor.chain().focus().unsetColor().run())}
        >
          {COLORS.map((c) => <option key={c.label} value={c.value}>{c.label}</option>)}
        </select>
        {Object.keys(placeholders).length > 0 && (
          <select
            className="email-editor__select"
            aria-label="Insert field"
            value=""
            onChange={(e) => {
              if (e.target.value) editor.chain().focus().insertContent(`{{${e.target.value}}}`).run();
            }}
          >
            <option value="">Insert field…</option>
            {Object.entries(placeholders).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        )}
        <span className="email-editor__sep" aria-hidden="true" />
        <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 /></ToolButton>
        <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 /></ToolButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default EmailEditor;
