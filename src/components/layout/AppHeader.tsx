import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface User {
  id: string;
  name: string;
  role: 'buyer' | 'developer';
  email?: string;
}

interface AppHeaderProps {
  user: User;
}

// Define page titles for breadcrumbs
const pageTitles: Record<string, string> = {
  '/developer': 'Dashboard',
  '/developer/products': 'Inventario',
  '/developer/ventas': 'Ventas',
  '/developer/cobranza': 'Cobranza',
  '/developer/sales': 'Ventas y Cobranza',
  '/buyer/contract': 'Mi Contrato',
  '/buyer/unit': 'Mi Unidad',
  '/buyer/payments': 'Mis Pagos',
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || 'LEOX'

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={user.role === 'developer' ? '/developer' : '/buyer'}>
                LEOX
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== '/developer' && pathname !== '/buyer' && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}