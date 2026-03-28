import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '个人助理',
    short_name: '助理',
    description: '你的待办、灵感与素材管理工具',
    start_url: '/today',
    display: 'standalone',
    background_color: '#FAF8F5',
    theme_color: '#F97316',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
