import { listThemes } from '@/modules/themes/theme.service'
import { WorkshopForm } from '@/components/workshops/workshop-form'

export const dynamic = 'force-dynamic'

export default async function NewWorkshopPage() {
  const themes = await listThemes()

  return (
    <main>
      <h1>Nova Oficina</h1>
      <WorkshopForm themes={themes} />
    </main>
  )
}
