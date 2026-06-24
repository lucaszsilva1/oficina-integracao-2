import { ThemeForm } from '@/components/themes/theme-form'

export default function NewThemePage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Novo Tema</h1>
      </div>
      <ThemeForm />
    </div>
  )
}
