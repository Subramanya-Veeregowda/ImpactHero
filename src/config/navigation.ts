import { LayoutDashboard, Target, Heart, Gift, Users, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Scores', path: '/scores', icon: Target },
  { name: 'Charities', path: '/charities', icon: Heart },
  { name: 'Winnings', path: '/winnings', icon: Gift },
];

export const adminNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Charities', path: '/admin/charities', icon: Heart },
  { name: 'Draws', path: '/admin/draws', icon: Trophy },
  { name: 'Winners', path: '/admin/winners', icon: Gift },
];
