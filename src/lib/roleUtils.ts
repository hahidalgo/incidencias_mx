// Reglas centralizadas de acceso por rol
type DashboardActions = 'incidencias' | 'datos' | 'reportes';
type EmployeeActions = 'create' | 'edit' | 'delete' | 'btnForm' | 'filter';
type IncidentActions = 'create' | 'edit' | 'delete' | 'btnForm' | 'filter';
type MovementActions = 'create' | 'edit' | 'delete' | 'btnForm' | 'filterOffice';

type RoleRules = {
  menu: Record<string, string[]>;
  dashboard: Record<DashboardActions, string[]>;
  employees: Record<EmployeeActions, string[]>;
  incidents: Record<IncidentActions, string[]>;
  movement: Record<MovementActions, string[]>;
  
};

export const roleRules: RoleRules = {
  menu: {
    companies: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    offices: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    periods: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    incidents: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    employees: ['SUPER_ADMIN', 'ENCARGADO_RRHH', 'SUPERVISOR_REGIONES', 'ENCARGADO_CASINO'],
    users: ['SUPER_ADMIN'],
  },
  dashboard: {
    incidencias: ['SUPER_ADMIN', 'ENCARGADO_RRHH', 'SUPERVISOR_REGIONES', 'ENCARGADO_CASINO'],
    datos: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    reportes: ['SUPER_ADMIN', 'SUPERVISOR_REGIONES', 'ENCARGADO_RRHH'],
  },
  employees: {
    btnForm: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    filter: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    create: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    edit: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    delete: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
  },
  incidents: {
    btnForm: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    filter: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    create: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    edit: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    delete: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
  },

  movement: {
    btnForm: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    filterOffice: ['SUPER_ADMIN', 'ENCARGADO_RRHH', 'SUPERVISOR_REGIONES', 'ENCARGADO_CASINO'],
    create: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    edit: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
    delete: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
  },
  

};

// Función reutilizable para validar acceso
type ActionType = EmployeeActions | DashboardActions | string;

export function canAccess(
  userRol: string | undefined,
  ruleKey: keyof RoleRules,
  action?: ActionType
) {
  if (!userRol) return false;
  const rule = roleRules[ruleKey];
  if (typeof rule === 'object' && action) {
    // Para objetos con acciones (dashboard, employees, formEmployees, menu)
    return Array.isArray((rule as Record<string, string[]>)[action]) && (rule as Record<string, string[]>)[action].includes(userRol);
  }
  if (Array.isArray(rule)) {

    return rule.includes(userRol);
  }
  
  return false;
} 