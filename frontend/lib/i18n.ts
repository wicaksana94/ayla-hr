import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'id' | 'es' | 'zh';

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'ayla-hr-language',
    }
  )
);

// Simple translation function
export const translations = {
  en: {
    common: {
      dashboard: "Dashboard",
      employees: "Employees",
      departments: "Departments",
      positions: "Positions",
      leaveRequests: "Leave Requests",
      myLeave: "My Leave",
      reports: "Reports",
      settings: "Settings",
      profile: "Profile",
      signOut: "Sign Out",
      signIn: "Sign In",
      signUp: "Sign Up",
    },
    navbar: {
      notifications: "Notifications",
      language: "Language",
    },
    dashboard: {
      welcome: "Welcome to AylaHR",
      totalEmployees: "Total Employees",
      pendingLeaves: "Pending Leaves",
      departments: "Departments",
      positions: "Positions",
      recentLeaveRequests: "Recent Leave Requests",
      quickActions: "Quick Actions",
    },
    leaveTypes: {
      annual: "Annual Leave",
      sick: "Sick Leave",
      maternity: "Maternity Leave",
      marriage: "Marriage Leave",
      bereavement: "Bereavement Leave",
      baptism: "Baptism/Circumcision Leave",
      paid_leave: "Paid Leave",
      unpaid_leave: "Unpaid Leave",
    }
  },
  id: {
    common: {
      dashboard: "Dasbor",
      employees: "Karyawan",
      departments: "Departemen",
      positions: "Posisi",
      leaveRequests: "Permintaan Cuti",
      myLeave: "Cuti Saya",
      reports: "Laporan",
      settings: "Pengaturan",
      profile: "Profil",
      signOut: "Keluar",
      signIn: "Masuk",
      signUp: "Daftar",
    },
    navbar: {
      notifications: "Notifikasi",
      language: "Bahasa",
    },
    dashboard: {
      welcome: "Selamat Datang di AylaHR",
      totalEmployees: "Total Karyawan",
      pendingLeaves: "Cuti Menunggu",
      departments: "Departemen",
      positions: "Posisi",
      recentLeaveRequests: "Permintaan Cuti Terbaru",
      quickActions: "Aksi Cepat",
    },
    leaveTypes: {
      annual: "Cuti Tahunan",
      sick: "Cuti Sakit",
      maternity: "Cuti Melahirkan",
      marriage: "Cuti Pernikahan",
      bereavement: "Cuti Kematian",
      baptism: "Cuti Baptis/Sunatan",
      paid_leave: "Cuti Berbayar",
      unpaid_leave: "Cuti Tidak Berbayar",
    }
  },
  es: {
    common: {
      dashboard: "Panel",
      employees: "Empleados",
      departments: "Departamentos",
      positions: "Posiciones",
      leaveRequests: "Solicitudes de Permiso",
      myLeave: "Mi Permiso",
      reports: "Informes",
      settings: "Configuración",
      profile: "Perfil",
      signOut: "Cerrar Sesión",
      signIn: "Iniciar Sesión",
      signUp: "Registrarse",
    },
    navbar: {
      notifications: "Notificaciones",
      language: "Idioma",
    },
    dashboard: {
      welcome: "Bienvenido a AylaHR",
      totalEmployees: "Total de Empleados",
      pendingLeaves: "Permisos Pendientes",
      departments: "Departamentos",
      positions: "Posiciones",
      recentLeaveRequests: "Solicitudes Recientes",
      quickActions: "Acciones Rápidas",
    },
    leaveTypes: {
      annual: "Permiso Anual",
      sick: "Permiso por Krankheit",
      maternity: "Permiso de Maternidad",
      marriage: "Permiso de Matrimonio",
      bereavement: "Permiso por Duelo",
      baptism: "Permiso de Bautizo/Circuncisión",
      paid_leave: "Permiso Pagado",
      unpaid_leave: "Permiso No Pagado",
    }
  },
  zh: {
    common: {
      dashboard: "仪表板",
      employees: "员工",
      departments: "部门",
      positions: "职位",
      leaveRequests: "请假申请",
      myLeave: "我的请假",
      reports: "报告",
      settings: "设置",
      profile: "个人资料",
      signOut: "退出登录",
      signIn: "登录",
      signUp: "注册",
    },
    navbar: {
      notifications: "通知",
      language: "语言",
    },
    dashboard: {
      welcome: "欢迎使用 AylaHR",
      totalEmployees: "员工总数",
      pendingLeaves: "待处理请假",
      departments: "部门",
      positions: "职位",
      recentLeaveRequests: "最近请假申请",
      quickActions: "快速操作",
    },
    leaveTypes: {
      annual: "年假",
      sick: "病假",
      maternity: "产假",
      marriage: "婚假",
      bereavement: "丧假",
      baptism: "洗礼/割礼假",
      paid_leave: "带薪假",
      unpaid_leave: "无薪假",
    }
  }
};

export function t(key: string, lang: Language = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}
