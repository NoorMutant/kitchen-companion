import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useStore } from '@/store/useStore';

const AdminLayout = () => {
  const user = useStore(s => s.user);

  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'counter') return <Navigate to="/pos" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card px-4">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold text-foreground">Restaurant POS</h1>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
