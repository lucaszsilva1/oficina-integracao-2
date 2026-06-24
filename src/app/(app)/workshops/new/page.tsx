import { listThemes } from '@/modules/themes/theme.service'
import { WorkshopForm } from '@/components/workshops/workshop-form'

export const dynamic = 'force-dynamic'

export default async function NewWorkshopPage() {
  const themes = await listThemes()

  return (
    <div className="page">
      <div className="page-header">
        <h1>Nova Oficina</h1>
      </div>
      <WorkshopForm themes={themes} />
    </div>
  )
}
