import { getNavigationByRole, navigationConfig, Role } from '@/config/navigation';

describe('Navigation Config', () => {
  describe('navigationConfig', () => {
    it('should have correct structure', () => {
      navigationConfig.forEach((group) => {
        expect(group).toHaveProperty('title');
        expect(group).toHaveProperty('items');
        expect(Array.isArray(group.items)).toBe(true);
        
        group.items.forEach((item) => {
          expect(item).toHaveProperty('name');
          expect(item).toHaveProperty('href');
          expect(item).toHaveProperty('icon');
          expect(item).toHaveProperty('roles');
          expect(Array.isArray(item.roles)).toBe(true);
        });
      });
    });

    it('should have Main group', () => {
      const mainGroup = navigationConfig.find(g => g.title === 'Main');
      expect(mainGroup).toBeDefined();
      expect(mainGroup?.items.length).toBeGreaterThan(0);
    });

    it('should have HR Management group', () => {
      const hrGroup = navigationConfig.find(g => g.title === 'HR Management');
      expect(hrGroup).toBeDefined();
    });

    it('should have Settings group', () => {
      const settingsGroup = navigationConfig.find(g => g.title === 'Settings');
      expect(settingsGroup).toBeDefined();
    });
  });

  describe('getNavigationByRole', () => {
    it('should return all items for admin role', () => {
      const items = getNavigationByRole('admin');
      expect(items.length).toBeGreaterThan(5);
    });

    it('should return limited items for employee role', () => {
      const items = getNavigationByRole('employee');
      expect(items.length).toBeLessThanOrEqual(3);
    });

    it('should return correct items for hr_manager role', () => {
      const items = getNavigationByRole('hr_manager');
      const itemNames = items.map(i => i.name);
      
      expect(itemNames).toContain('Dashboard');
      expect(itemNames).toContain('Employees');
      expect(itemNames).toContain('Departments');
      expect(itemNames).toContain('Positions');
      expect(itemNames).toContain('Leave Requests');
    });

    it('should return correct items for manager role', () => {
      const items = getNavigationByRole('manager');
      const itemNames = items.map(i => i.name);
      
      expect(itemNames).toContain('Dashboard');
      expect(itemNames).toContain('Leave Requests');
      expect(itemNames).not.toContain('Employees');
    });

    it('should return correct items for employee role', () => {
      const items = getNavigationByRole('employee');
      const itemNames = items.map(i => i.name);
      
      expect(itemNames).toContain('Dashboard');
      expect(itemNames).toContain('My Leave');
      expect(itemNames).not.toContain('Employees');
      expect(itemNames).not.toContain('Leave Requests');
    });
  });

  describe('Role-based access', () => {
    it('Dashboard should be accessible by all roles', () => {
      const roles: Role[] = ['admin', 'hr_manager', 'manager', 'employee'];
      
      roles.forEach((role) => {
        const items = getNavigationByRole(role);
        const hasDashboard = items.some(i => i.name === 'Dashboard');
        expect(hasDashboard).toBe(true);
      });
    });

    it('Employees should only be accessible by admin and hr_manager', () => {
      const adminItems = getNavigationByRole('admin');
      const hrItems = getNavigationByRole('hr_manager');
      const managerItems = getNavigationByRole('manager');
      const employeeItems = getNavigationByRole('employee');
      
      expect(adminItems.some(i => i.name === 'Employees')).toBe(true);
      expect(hrItems.some(i => i.name === 'Employees')).toBe(true);
      expect(managerItems.some(i => i.name === 'Employees')).toBe(false);
      expect(employeeItems.some(i => i.name === 'Employees')).toBe(false);
    });

    it('Reports should only be accessible by admin and hr_manager', () => {
      const adminItems = getNavigationByRole('admin');
      const hrItems = getNavigationByRole('hr_manager');
      const managerItems = getNavigationByRole('manager');
      
      expect(adminItems.some(i => i.name === 'Reports')).toBe(true);
      expect(hrItems.some(i => i.name === 'Reports')).toBe(true);
      expect(managerItems.some(i => i.name === 'Reports')).toBe(false);
    });
  });
});
