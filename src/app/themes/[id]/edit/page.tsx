import { notFound } from 'next/navigation'
import { ThemeForm } from '@/components/themes/theme-form'
import { findById } from '@/modules/themes/theme.repository'

type Props = {
  params: { id: string }
}

export default async function EditThemePage({ params }: Props) {
  const theme = await findById(params.id)
  if (!theme) notFound()

  return (
    <main>
      <h1>Editar Tema</h1>
      <ThemeForm theme={theme} />
    </main>
  )
}
