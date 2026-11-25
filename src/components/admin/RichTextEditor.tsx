'use client'

import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import { Extension, Node, mergeAttributes } from '@tiptap/core'
import { formatArticleHtml } from '@/lib/formatArticleHtml'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link2,
  Unlink,
  Image as ImageIcon,
  Video as VideoIcon,
  Undo2,
  Redo2,
  Highlighter,
  Type,
  Minus,
  RemoveFormatting,
  Upload,
  Loader2,
  Code,
  X,
  Trash2,
  FileText,
} from 'lucide-react'

type ImageAlign = 'left' | 'right' | 'center' | 'full'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    editorialImage: {
      setImage: (options: {
        src: string
        alt?: string
        caption?: string | null
        align?: ImageAlign
        width?: string | null
      }) => ReturnType
    }
  }
}

// Custom TipTap FontSize extension riding on TextStyle (supports micro 9px/10px up to 32px)
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              if (element.tagName === 'SMALL') return '10px'
              return element.style.fontSize?.replace(/['"]+/g, '') || null
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as any
  },
})

function detectAlignFromElement(el: HTMLElement): ImageAlign {
  const explicit = el.getAttribute('data-align')
  if (explicit === 'left' || explicit === 'right' || explicit === 'center' || explicit === 'full') {
    return explicit
  }
  const cls = el.className || ''
  if (cls.includes('alignleft') || el.style?.float === 'left') return 'left'
  if (cls.includes('alignright') || el.style?.float === 'right') return 'right'
  if (cls.includes('aligncenter')) return 'center'
  return 'full'
}

function normalizeWidthAttr(rawWidth: string | null | undefined, align: ImageAlign): string | null {
  if (align === 'full') return null
  if (!rawWidth) {
    return align === 'left' || align === 'right' ? '45%' : null
  }
  const trimmed = rawWidth.trim()
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) return `${trimmed}px`
  return trimmed
}

// Editorial Image / Figure node supporting WordPress-style left/right floats, custom widths, and captions
const EditorialImageNode = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      caption: { default: null },
      align: { default: 'full' },
      width: { default: null },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (node) => {
          const el = node as HTMLElement
          const img = el.querySelector('img')
          if (!img) return false
          const src = img.getAttribute('src')
          if (!src) return false
          const align = detectAlignFromElement(el) !== 'full'
            ? detectAlignFromElement(el)
            : detectAlignFromElement(img)
          const rawW = el.style?.width || img.style?.width || img.getAttribute('width')
          const caption = el.querySelector('figcaption')?.textContent?.trim() || null
          return {
            src,
            alt: img.getAttribute('alt') || caption || null,
            caption,
            align,
            width: normalizeWidthAttr(rawW, align),
          }
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (node) => {
          const el = node as HTMLElement
          const src = el.getAttribute('src')
          if (!src) return false
          const align = detectAlignFromElement(el)
          const rawW = el.style?.width || el.getAttribute('width')
          return {
            src,
            alt: el.getAttribute('alt') || null,
            caption: null,
            align,
            width: normalizeWidthAttr(rawW, align),
          }
        },
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    const align: ImageAlign = HTMLAttributes.align || 'full'
    const width: string | null = HTMLAttributes.width || null
    const caption: string | null = HTMLAttributes.caption || null
    const style = width && align !== 'full' ? `width: ${width};` : undefined

    return [
      'figure',
      {
        class: 'article-figure',
        'data-align': align,
        ...(style ? { style } : {}),
      },
      [
        'img',
        {
          src: HTMLAttributes.src,
          alt: HTMLAttributes.alt || caption || 'Foto da matéria',
        },
      ],
      ...(caption ? [['figcaption', {}, caption]] : []),
    ]
  },
  addCommands() {
    return {
      setImage:
        (options: {
          src: string
          alt?: string
          caption?: string | null
          align?: ImageAlign
          width?: string | null
        }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              alt: options.alt || null,
              caption: options.caption || null,
              align: options.align || 'full',
              width: options.width || null,
            },
          })
        },
    } as any
  },
})

// Native HTML5 <video> node for uploaded MP4/WebM/MOV files
const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
    }
  },
  parseHTML() {
    return [{ tag: 'video[src]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, {
        controls: 'true',
        playsinline: 'true',
        preload: 'metadata',
        class: 'w-full rounded my-4 bg-black max-h-[520px]',
      }),
    ]
  },
})

// Responsive iframe embed node for YouTube / Vimeo / Instagram
const VideoEmbedNode = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed]',
        getAttrs: (el) => {
          const iframe = (el as HTMLElement).querySelector('iframe')
          return iframe ? { src: iframe.getAttribute('src') } : false
        },
      },
      {
        tag: 'iframe[src]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        'data-video-embed': '',
        class: 'my-5 aspect-video w-full overflow-hidden rounded bg-black shadow-sm',
      },
      [
        'iframe',
        mergeAttributes(HTMLAttributes, {
          class: 'w-full h-full border-0',
          allowfullscreen: 'true',
          loading: 'lazy',
        }),
      ],
    ]
  },
})

function resolveVideoInput(rawUrl: string): { kind: 'video' | 'embed'; src: string } {
  const url = rawUrl.trim()

  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i
  )
  if (ytMatch) {
    return { kind: 'embed', src: `https://www.youtube.com/embed/${ytMatch[1]}` }
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vimeoMatch) {
    return { kind: 'embed', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` }
  }

  const igMatch = url.match(/instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/i)
  if (igMatch) {
    return { kind: 'embed', src: `https://www.instagram.com/${igMatch[1]}/${igMatch[2]}/embed` }
  }

  return { kind: 'video', src: url }
}

async function uploadImageToServer(file: File): Promise<string | null> {
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'media')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    return res.ok && data.url ? data.url : null
  } catch {
    return null
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function processPastedHtmlImages(html: string, fallbackFiles: File[]): Promise<string> {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const imgs = Array.from(doc.querySelectorAll('img'))
  let fileIdx = 0

  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i]
    const src = img.getAttribute('src') || ''
    if (src.startsWith('data:image/')) {
      const file = dataUrlToFile(src, i)
      if (file) {
        const uploadedUrl = await uploadImageToServer(file)
        if (uploadedUrl) img.setAttribute('src', uploadedUrl)
      }
    } else if (
      (!src || src.startsWith('file://') || src.startsWith('blob:')) &&
      fileIdx < fallbackFiles.length
    ) {
      const uploadedUrl = await uploadImageToServer(fallbackFiles[fileIdx++])
      if (uploadedUrl) img.setAttribute('src', uploadedUrl)
    }
  }

  return doc.body.innerHTML
}

function dataUrlToFile(dataUrl: string, index: number): File | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/)
  if (!match) return null
  const mime = match[1]
  const b64 = match[2]
  const binStr = atob(b64)
  const len = binStr.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binStr.charCodeAt(i)
  }
  const ext = mime.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'png'
  return new File([bytes], `pasted-image-${Date.now()}-${index}.${ext}`, { type: mime })
}

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

const FONT_FAMILIES = [
  { label: 'Jornal (Serifada)', value: 'var(--font-source-serif), Georgia, serif' },
  { label: 'Moderna (Sem serifa)', value: 'var(--font-archivo), Arial, sans-serif' },
  { label: 'Destaque (Forte)', value: 'var(--font-archivo-black), Impact, sans-serif' },
  { label: 'Clássica (Georgia)', value: 'Georgia, serif' },
  { label: 'Padrão (Arial)', value: 'Arial, Helvetica, sans-serif' },
]

const FONT_SIZES = [
  { label: '9 px (Micro / Fonte)', value: '9px' },
  { label: '10 px (Crédito)', value: '10px' },
  { label: '12 px (Legenda)', value: '12px' },
  { label: '14 px (Pequeno)', value: '14px' },
  { label: '16 px (Normal)', value: '16px' },
  { label: '18 px (Jornal)', value: '18px' },
  { label: '20 px (Médio)', value: '20px' },
  { label: '24 px (Grande)', value: '24px' },
  { label: '28 px (Destaque)', value: '28px' },
  { label: '32 px (Manchete)', value: '32px' },
]

const TEXT_COLORS = [
  '#0f172a',
  '#0038a8',
  '#c8102e',
  '#64748b',
  '#15803d',
  '#b45309',
  '#7c3aed',
  '#ffffff',
]

const BG_COLORS = [
  '#fef08a',
  '#dbeafe',
  '#fee2e2',
  '#dcfce7',
  '#f1f5f9',
  '#0038a8',
  '#c8102e',
  '#0f172a',
]

const IMAGE_WIDTH_PRESETS = [
  { label: 'Logo / Mini', value: '190px' },
  { label: 'Pequena (35%)', value: '35%' },
  { label: 'Média (48%)', value: '48%' },
  { label: 'Grande (68%)', value: '68%' },
  { label: 'Inteira (100%)', value: '100%' },
]

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [showLinkBox, setShowLinkBox] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageBox, setShowImageBox] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageAltInput, setImageAltInput] = useState('')
  const [imageAlignInput, setImageAlignInput] = useState<ImageAlign>('full')
  const [imageWidthInput, setImageWidthInput] = useState<string>('100%')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [pastingMedia, setPastingMedia] = useState(false)
  const [showVideoBox, setShowVideoBox] = useState(false)
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [showColorMenu, setShowColorMenu] = useState<'text' | 'bg' | null>(null)
  const [showHtmlSource, setShowHtmlSource] = useState(false)
  const lastExternalValueRef = useRef<string>(value)
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'text-primary underline hover:opacity-80',
        },
      }),
      EditorialImageNode,
      VideoNode,
      VideoEmbedNode,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'justify',
      }),
    ],
    content: formatArticleHtml(value || ''),
    editorProps: {
      attributes: {
        class:
          'article-prose min-h-[420px] max-h-[680px] overflow-y-auto p-4 sm:p-5 focus:outline-none',
      },
      handlePaste: (_view, event) => {
        const clipboard = event.clipboardData
        if (!clipboard) return false

        const imageFiles: File[] = []
        if (clipboard.files && clipboard.files.length > 0) {
          for (const f of Array.from(clipboard.files)) {
            if (f.type.startsWith('image/')) imageFiles.push(f)
          }
        } else if (clipboard.items) {
          for (const item of Array.from(clipboard.items)) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
              const f = item.getAsFile()
              if (f) imageFiles.push(f)
            }
          }
        }

        const textHtml = clipboard.getData('text/html') || ''
        const textPlain = (clipboard.getData('text/plain') || '').trim()

        // 1. Imagem copiada direto (PrintScreen, WhatsApp, "Copiar imagem" sem texto)
        if (imageFiles.length > 0 && !textPlain) {
          event.preventDefault()
          setPastingMedia(true)
          ;(async () => {
            try {
              for (const file of imageFiles) {
                const url = (await uploadImageToServer(file)) || (await fileToDataUrl(file))
                if (url) {
                  editorRef.current?.chain().focus().setImage({ src: url, alt: 'Foto da matéria' }).run()
                }
              }
            } finally {
              setPastingMedia(false)
            }
          })()
          return true
        }

        // 2. HTML copiado de Word/Docs/Sites contendo data:image ou file:// ou blob:
        if (textHtml && /<img[^>]+src=["'](?:data:image\/|file:\/\/|blob:)/i.test(textHtml)) {
          event.preventDefault()
          setPastingMedia(true)
          ;(async () => {
            try {
              const cleanedHtml = await processPastedHtmlImages(textHtml, imageFiles)
              editorRef.current?.chain().focus().insertContent(cleanedHtml).run()
            } finally {
              setPastingMedia(false)
            }
          })()
          return true
        }

        // 3. Código HTML contendo imagem/figure colado como texto puro
        if (!textHtml && textPlain.startsWith('<') && /<(?:img|figure)\b/i.test(textPlain)) {
          event.preventDefault()
          if (/src=["']data:image\//i.test(textPlain)) {
            setPastingMedia(true)
            ;(async () => {
              try {
                const cleaned = await processPastedHtmlImages(textPlain, [])
                editorRef.current?.chain().focus().insertContent(cleaned).run()
              } finally {
                setPastingMedia(false)
              }
            })()
          } else {
            editorRef.current?.chain().focus().insertContent(textPlain).run()
          }
          return true
        }

        // 4. URL direta de imagem colada como texto puro
        if (!textHtml && /^https?:\/\/\S+\.(?:jpg|jpeg|png|webp|gif)(?:\?\S*)?$/i.test(textPlain)) {
          event.preventDefault()
          editorRef.current?.chain().focus().setImage({ src: textPlain, alt: 'Foto da matéria' }).run()
          return true
        }

        return false
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files?.length) return false
        const imageFiles = Array.from(event.dataTransfer.files).filter((f) =>
          f.type.startsWith('image/')
        )
        if (imageFiles.length === 0) return false

        event.preventDefault()
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
        setPastingMedia(true)
        ;(async () => {
          try {
            for (const file of imageFiles) {
              const url = await uploadImageToServer(file)
              if (url) {
                const chain = editorRef.current?.chain().focus()
                if (coords) {
                  chain?.setTextSelection(coords.pos)
                }
                chain?.setImage({ src: url, alt: 'Foto da matéria' }).run()
              }
            }
          } finally {
            setPastingMedia(false)
          }
        })()
        return true
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      lastExternalValueRef.current = html
      onChange(html)
    },
  })

  editorRef.current = editor

  useEffect(() => {
    if (!editor) return
    if (value !== lastExternalValueRef.current) {
      lastExternalValueRef.current = value
      editor.commands.setContent(formatArticleHtml(value || ''), false)
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className="rounded-lg border border-slate-300 bg-slate-50 p-8 text-center text-xs text-slate-500">
        Carregando editor visual...
      </div>
    )
  }

  const currentHeadingValue = editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
    ? 'h3'
    : editor.isActive('heading', { level: 4 })
    ? 'h4'
    : 'p'

  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || ''
  const currentFontSize = editor.getAttributes('textStyle').fontSize || ''
  const currentTextColor = editor.getAttributes('textStyle').color || '#0f172a'
  const currentBgColor = editor.getAttributes('highlight').color || '#fef08a'

  const isImageSelected = editor.isActive('image')
  const selectedImgAttrs = isImageSelected ? editor.getAttributes('image') : null

  const updateSelectedImage = (attrs: Partial<{ align: ImageAlign; width: string | null; caption: string | null }>) => {
    editor.chain().focus().updateAttributes('image', attrs).run()
  }

  const handleHeadingChange = (val: string) => {
    const chain = editor.chain().focus()
    if (val === 'p') chain.setParagraph().run()
    else if (val === 'h2') chain.toggleHeading({ level: 2 }).run()
    else if (val === 'h3') chain.toggleHeading({ level: 3 }).run()
    else if (val === 'h4') chain.toggleHeading({ level: 4 }).run()
  }

  const handleApplyMicroFonte = () => {
    const chain = editor.chain().focus()
    ;(chain as any).setFontSize('10px').setColor('#64748b').run()
  }

  const closeAllPanels = () => {
    setShowLinkBox(false)
    setShowImageBox(false)
    setShowVideoBox(false)
    setShowColorMenu(null)
  }

  const handleOpenLinkBox = () => {
    const prev = editor.getAttributes('link').href || ''
    setLinkUrl(prev)
    const nextState = !showLinkBox
    closeAllPanels()
    setShowLinkBox(nextState)
  }

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = linkUrl.trim()
    if (!trimmed) {
      editor.chain().focus().unsetLink().run()
      setShowLinkBox(false)
      return
    }
    const normalizedUrl =
      /^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed) ? trimmed : `https://${trimmed}`

    editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedUrl }).run()
    setShowLinkBox(false)
    setLinkUrl('')
  }

  const insertConfiguredImage = (url: string) => {
    const caption = imageAltInput.trim() || null
    const align = imageAlignInput
    const width =
      align === 'full'
        ? null
        : imageWidthInput === '100%'
        ? '48%'
        : imageWidthInput

    ;(editor.chain().focus() as any)
      .setImage({
        src: url,
        alt: caption || 'Foto da matéria',
        caption,
        align,
        width,
      })
      .run()
  }

  const handleImageFileUpload = async (file: File | undefined) => {
    if (!file) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'media')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        insertConfiguredImage(data.url)
        setShowImageBox(false)
        setImageUrlInput('')
        setImageAltInput('')
      } else {
        alert(data.error || 'Erro ao enviar imagem')
      }
    } catch {
      alert('Erro de conexão ao enviar foto')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleInsertImageByUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrlInput.trim()) return
    insertConfiguredImage(imageUrlInput.trim())
    setShowImageBox(false)
    setImageUrlInput('')
    setImageAltInput('')
  }

  const handleVideoFileUpload = async (file: File | undefined) => {
    if (!file) return
    setUploadingVideo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'media')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        editor
          .chain()
          .focus()
          .insertContent({ type: 'video', attrs: { src: data.url } })
          .run()
        setShowVideoBox(false)
        setVideoUrlInput('')
      } else {
        alert(data.error || 'Erro ao enviar vídeo')
      }
    } catch {
      alert('Erro de conexão ao enviar vídeo')
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleInsertVideoByUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoUrlInput.trim()) return
    const resolved = resolveVideoInput(videoUrlInput)
    editor
      .chain()
      .focus()
      .insertContent({
        type: resolved.kind === 'embed' ? 'videoEmbed' : 'video',
        attrs: { src: resolved.src },
      })
      .run()
    setShowVideoBox(false)
    setVideoUrlInput('')
  }

  const btnClass = (active: boolean) =>
    `p-1.5 rounded text-xs transition-colors flex items-center justify-center ${
      active
        ? 'bg-primary text-white shadow-sm'
        : 'text-slate-700 hover:bg-slate-200/70'
    }`

  return (
    <div className="rounded-xl border border-slate-300 bg-white overflow-visible shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50/95 p-2.5 rounded-t-xl space-y-2 sticky top-0 z-20">
        {/* Linha 1: Undo/Redo, Bloco, Fonte, Tamanho, HTML */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`${btnClass(false)} disabled:opacity-30`}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`${btnClass(false)} disabled:opacity-30`}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>

          <span className="h-5 w-px bg-slate-300 mx-0.5" />

          <select
            aria-label="Estilo do texto"
            value={currentHeadingValue}
            onChange={(e) => handleHeadingChange(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
            title="Estilo / Título"
          >
            <option value="p">Parágrafo normal</option>
            <option value="h2">Título (H2)</option>
            <option value="h3">Subtítulo (H3)</option>
            <option value="h4">Subtítulo Menor (H4)</option>
          </select>

          <select
            aria-label="Tipo de fonte"
            value={currentFontFamily}
            onChange={(e) => {
              const v = e.target.value
              if (!v) editor.chain().focus().unsetFontFamily().run()
              else editor.chain().focus().setFontFamily(v).run()
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:border-primary"
            title="Escolher fonte"
          >
            <option value="">Fonte (Padrão Jornal)</option>
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Tamanho da fonte"
            value={currentFontSize}
            onChange={(e) => {
              const v = e.target.value
              if (!v) (editor.chain().focus() as any).unsetFontSize().run()
              else (editor.chain().focus() as any).setFontSize(v).run()
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:border-primary"
            title="Tamanho do texto"
          >
            <option value="">Tamanho (Padrão)</option>
            {FONT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowHtmlSource((s) => !s)}
            className={`ml-auto px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 border ${
              showHtmlSource
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
            title="Alternar modo HTML"
          >
            <Code size={13} />
            <span>{showHtmlSource ? 'Voltar ao Visual' : 'HTML'}</span>
          </button>
        </div>

        {/* Linha 2: Formatação, Cores, Alinhamento, Link, Fonte Micro, Foto e Vídeo */}
        {!showHtmlSource && (
          <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={btnClass(editor.isActive('bold'))}
              title="Negrito (Ctrl+B)"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={btnClass(editor.isActive('italic'))}
              title="Itálico (Ctrl+I)"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={btnClass(editor.isActive('underline'))}
              title="Sublinhado (Ctrl+U)"
            >
              <UnderlineIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={btnClass(editor.isActive('strike'))}
              title="Tachado"
            >
              <Strikethrough size={15} />
            </button>

            <span className="h-5 w-px bg-slate-300 mx-0.5" />

            {/* Cor do Texto */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorMenu((m) => (m === 'text' ? null : 'text'))}
                className="p-1.5 rounded text-xs text-slate-700 hover:bg-slate-200/70 flex items-center gap-1"
                title="Cor do texto"
              >
                <Type size={15} />
                <span
                  className="w-3 h-3 rounded-sm border border-slate-300"
                  style={{ backgroundColor: currentTextColor }}
                />
              </button>

              {showColorMenu === 'text' && (
                <div className="absolute left-0 top-full mt-1 z-30 w-48 rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg space-y-2">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Cor da Letra</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          editor.chain().focus().setColor(c).run()
                          setShowColorMenu(null)
                        }}
                        className="w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <label className="text-[11px] text-slate-600 flex items-center gap-1.5 cursor-pointer">
                      <span>Outra:</span>
                      <input
                        type="color"
                        value={currentTextColor}
                        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                        className="w-6 h-6 cursor-pointer border-0 p-0"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().unsetColor().run()
                        setShowColorMenu(null)
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Padrão
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cor de Fundo / Destaque */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorMenu((m) => (m === 'bg' ? null : 'bg'))}
                className="p-1.5 rounded text-xs text-slate-700 hover:bg-slate-200/70 flex items-center gap-1"
                title="Cor de fundo / Marca-texto"
              >
                <Highlighter size={15} />
                <span
                  className="w-3 h-3 rounded-sm border border-slate-300"
                  style={{ backgroundColor: currentBgColor }}
                />
              </button>

              {showColorMenu === 'bg' && (
                <div className="absolute left-0 top-full mt-1 z-30 w-48 rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg space-y-2">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Cor de Fundo</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BG_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          editor.chain().focus().setHighlight({ color: c }).run()
                          setShowColorMenu(null)
                        }}
                        className="w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <label className="text-[11px] text-slate-600 flex items-center gap-1.5 cursor-pointer">
                      <span>Outra:</span>
                      <input
                        type="color"
                        value={currentBgColor}
                        onChange={(e) =>
                          editor.chain().focus().setHighlight({ color: e.target.value }).run()
                        }
                        className="w-6 h-6 cursor-pointer border-0 p-0"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().unsetHighlight().run()
                        setShowColorMenu(null)
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      Sem fundo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <span className="h-5 w-px bg-slate-300 mx-0.5" />

            {/* Alinhamentos */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={btnClass(editor.isActive({ textAlign: 'justify' }))}
              title="Justificado"
            >
              <AlignJustify size={15} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={btnClass(editor.isActive({ textAlign: 'left' }))}
              title="Alinhar à esquerda"
            >
              <AlignLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={btnClass(editor.isActive({ textAlign: 'center' }))}
              title="Centralizar"
            >
              <AlignCenter size={15} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={btnClass(editor.isActive({ textAlign: 'right' }))}
              title="Alinhar à direita"
            >
              <AlignRight size={15} />
            </button>

            <span className="h-5 w-px bg-slate-300 mx-0.5" />

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={btnClass(editor.isActive('bulletList'))}
              title="Lista com marcadores"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={btnClass(editor.isActive('orderedList'))}
              title="Lista numerada"
            >
              <ListOrdered size={15} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={btnClass(editor.isActive('blockquote'))}
              title="Citação destacada"
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className={btnClass(false)}
              title="Linha divisória"
            >
              <Minus size={15} />
            </button>

            <span className="h-5 w-px bg-slate-300 mx-0.5" />

            <button
              type="button"
              onClick={handleOpenLinkBox}
              className={btnClass(editor.isActive('link') || showLinkBox)}
              title="Adicionar ou editar link"
            >
              <Link2 size={15} />
            </button>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className={btnClass(false)}
                title="Remover link"
              >
                <Unlink size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className={btnClass(false)}
              title="Limpar formatação do trecho selecionado"
            >
              <RemoveFormatting size={15} />
            </button>

            <button
              type="button"
              onClick={handleApplyMicroFonte}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold bg-slate-200/70 text-slate-700 hover:bg-slate-300/70 transition-colors"
              title="Deixar linha selecionada bem pequena e discreta (para Fonte / Créditos no final)"
            >
              <FileText size={12} />
              <span>Fonte (10px)</span>
            </button>

            <span className="h-5 w-px bg-slate-300 mx-0.5" />

            <button
              type="button"
              onClick={() => {
                const next = !showImageBox
                closeAllPanels()
                setShowImageBox(next)
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
                showImageBox
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
              title="Adicionar imagem dentro da matéria"
            >
              <ImageIcon size={14} />
              <span>Adicionar Foto</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !showVideoBox
                closeAllPanels()
                setShowVideoBox(next)
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
                showVideoBox
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-accent/10 text-accent hover:bg-accent/20'
              }`}
              title="Adicionar vídeo (arquivo MP4/MOV ou link do YouTube/Vimeo/Instagram)"
            >
              <VideoIcon size={14} />
              <span>Adicionar Vídeo</span>
            </button>
          </div>
        )}

        {/* Barra contextual quando uma imagem está clicada/selecionada dentro do texto */}
        {!showHtmlSource && isImageSelected && selectedImgAttrs && (
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/80 p-2.5 text-xs">
            <span className="font-bold text-primary uppercase text-[10px] tracking-wider">
              Foto selecionada:
            </span>

            {/* Alinhamento da Foto */}
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'left', label: 'Esquerda (texto ao lado)' },
                  { id: 'center', label: 'Centro' },
                  { id: 'right', label: 'Direita (texto ao lado)' },
                  { id: 'full', label: 'Inteira' },
                ] as { id: ImageAlign; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    updateSelectedImage({
                      align: opt.id,
                      width:
                        opt.id === 'full'
                          ? null
                          : selectedImgAttrs.width || (opt.id === 'center' ? '75%' : '45%'),
                    })
                  }
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    (selectedImgAttrs.align || 'full') === opt.id
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <span className="h-4 w-px bg-blue-200" />

            {/* Tamanho da Foto */}
            <select
              aria-label="Tamanho da imagem"
              value={selectedImgAttrs.width || (selectedImgAttrs.align === 'full' ? '100%' : '48%')}
              onChange={(e) => {
                const w = e.target.value
                updateSelectedImage({
                  width: w === '100%' ? null : w,
                  align: w === '100%' ? 'full' : selectedImgAttrs.align === 'full' ? 'left' : selectedImgAttrs.align,
                })
              }}
              className="rounded border border-blue-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
            >
              {IMAGE_WIDTH_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
              {selectedImgAttrs.width &&
                !IMAGE_WIDTH_PRESETS.some((p) => p.value === selectedImgAttrs.width) && (
                  <option value={selectedImgAttrs.width}>{selectedImgAttrs.width}</option>
                )}
            </select>

            <input
              type="text"
              placeholder="Legenda abaixo da foto..."
              value={selectedImgAttrs.caption || ''}
              onChange={(e) => updateSelectedImage({ caption: e.target.value || null })}
              className="flex-1 min-w-[160px] rounded border border-blue-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 focus:outline-none focus:border-primary"
            />

            <button
              type="button"
              onClick={() => editor.chain().focus().deleteSelection().run()}
              className="inline-flex items-center gap-1 rounded bg-white border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
              title="Remover esta foto"
            >
              <Trash2 size={12} /> Remover
            </button>
          </div>
        )}

        {/* Painel Inline de Hiperlink */}
        {showLinkBox && !showHtmlSource && (
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-2.5">
            <input
              type="text"
              placeholder="Cole o endereço do link (ex: https://guarulhos.sp.gov.br)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleApplyLink(e)
                }
              }}
              className="flex-1 min-w-[200px] rounded border border-slate-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
              autoFocus
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-dark"
            >
              Aplicar Link
            </button>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetLink().run()
                  setShowLinkBox(false)
                }}
                className="rounded border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                Remover
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowLinkBox(false)}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Painel Inline de Adicionar Foto */}
        {showImageBox && !showHtmlSource && (
          <div className="mt-2 rounded-lg border border-primary/30 bg-white p-3.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-primary flex items-center gap-1.5">
                <ImageIcon size={14} /> Inserir Imagem no Corpo da Matéria
              </p>
              <button
                type="button"
                onClick={() => setShowImageBox(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Posição / Alinhamento
                </label>
                <select
                  value={imageAlignInput}
                  onChange={(e) => {
                    const a = e.target.value as ImageAlign
                    setImageAlignInput(a)
                    if (a === 'full') setImageWidthInput('100%')
                    else if (imageWidthInput === '100%') setImageWidthInput('48%')
                  }}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                >
                  <option value="full">Largura Total (abaixo do texto)</option>
                  <option value="left">À Esquerda (texto ao lado)</option>
                  <option value="right">À Direita (texto ao lado)</option>
                  <option value="center">Centralizada</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tamanho da Foto
                </label>
                <select
                  value={imageWidthInput}
                  onChange={(e) => {
                    const w = e.target.value
                    setImageWidthInput(w)
                    if (w === '100%') setImageAlignInput('full')
                    else if (imageAlignInput === 'full') setImageAlignInput('left')
                  }}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                >
                  {IMAGE_WIDTH_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Legenda (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Secom/PMSP"
                  value={imageAltInput}
                  onChange={(e) => setImageAltInput(e.target.value)}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 items-center pt-1">
              <label className="flex items-center justify-center gap-2 cursor-pointer rounded-lg bg-primary hover:bg-primary-dark text-white px-4 py-2 text-xs font-bold transition-colors">
                {uploadingImage ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Enviando foto...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Escolher Foto do Computador</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    handleImageFileUpload(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ou cole a URL da imagem (https://...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleInsertImageByUrl(e)
                    }
                  }}
                  className="flex-1 rounded border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleInsertImageByUrl}
                  className="rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Inserir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Painel Inline de Adicionar Vídeo */}
        {showVideoBox && !showHtmlSource && (
          <div className="mt-2 rounded-lg border border-accent/30 bg-white p-3.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-accent flex items-center gap-1.5">
                <VideoIcon size={14} /> Inserir Vídeo no Corpo da Matéria
              </p>
              <button
                type="button"
                onClick={() => setShowVideoBox(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 items-center">
              <label className="flex items-center justify-center gap-2 cursor-pointer rounded-lg bg-accent hover:bg-accent-dark text-white px-4 py-2 text-xs font-bold transition-colors">
                {uploadingVideo ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Enviando vídeo...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Subir Vídeo do Computador (MP4/MOV)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  disabled={uploadingVideo}
                  onChange={(e) => {
                    handleVideoFileUpload(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </label>

              <p className="text-[11px] text-slate-500">
                Arquivos MP4, WebM ou MOV (até 50 MB) ou cole um link do YouTube, Shorts, Vimeo ou Instagram abaixo.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Cole link do YouTube, Shorts, Vimeo, Instagram ou URL .mp4"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleInsertVideoByUrl(e)
                  }
                }}
                className="flex-1 rounded border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleInsertVideoByUrl}
                className="rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Inserir Vídeo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de upload ao colar/arrastar */}
      {pastingMedia && (
        <div className="flex items-center gap-2 bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs font-semibold text-primary">
          <Loader2 size={14} className="animate-spin" />
          <span>Processando e enviando imagem colada...</span>
        </div>
      )}

      {/* Área de Edição */}
      {showHtmlSource ? (
        <textarea
          rows={16}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-50 focus:outline-none resize-y rounded-b-xl"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
      <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-500 rounded-b-xl">
        Dica: Clique em qualquer foto dentro do texto para mudar o alinhamento (<strong>Esquerda/Direita com texto ao lado</strong>), tamanho ou legenda. Use <strong>Fonte (10px)</strong> para créditos discretos no final.
      </div>
    </div>
  )
}
