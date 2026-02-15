/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // 其他环境变量可以在这里添加
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
