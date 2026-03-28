'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onUpload: (url: string) => void
}

export default function ImageUpload({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('materials').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('materials').getPublicUrl(path)
      onUpload(data.publicUrl)
    }
    setUploading(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs px-3 py-1.5 bg-stone-100 text-text-muted rounded-full hover:bg-stone-200 transition-colors"
      >
        {uploading ? '上传中...' : '📷 上传图片'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </>
  )
}
