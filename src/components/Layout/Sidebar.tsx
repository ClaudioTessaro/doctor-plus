import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Package,
  FileText,
  UserCog,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Pacientes', path: '/pacientes' },
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: FileText, label: 'Prontuários', path: '/prontuarios' },
    { icon: Package, label: 'Estoque', path: '/estoque' },
    { icon: UserCog, label: 'Secretários', path: '/secretarios', roles: ['ADMIN', 'PROFISSIONAL'] },
    { icon: Stethoscope, label: 'Profissionais', path: '/profissionais', roles: ['ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.tipo || '')
  );

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 flex flex-col h-full ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
            <Stethoscope className="h-8 w-8 text-blue-600" />
            {!collapsed && (
              <span className="ml-2 text-xl font-bold text-gray-800">DoctorPlus</span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto">
        {!collapsed && user && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900">{user.nome}</div>
            <div className="text-xs text-gray-500">{user.tipo}</div>
          </div>
        )}
        <button
          onClick={signOut}
          className={`flex items-center w-full px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sair</span>}
        </button>
      </div>
    </div>
  );
}