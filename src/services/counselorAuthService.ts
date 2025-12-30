import { supabase } from '../config/supabase';

export interface Counselor {
  id: string;
  email: string;
  name: string;
  role: 'pool_management' | 'essay';
}

export const counselorAuthService = {
  login: async (email: string, password: string): Promise<Counselor | null> => {
    const { data, error } = await supabase
      .from('counselors')
      .select('id, email, name, password_hash, role')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Invalid credentials');
    }

    if (data.password_hash !== `demo_hash_${password}`) {
      throw new Error('Invalid credentials');
    }

    const counselor: Counselor = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as 'pool_management' | 'essay',
    };

    localStorage.setItem('counselor', JSON.stringify(counselor));
    return counselor;
  },

  logout: () => {
    localStorage.removeItem('counselor');
  },

  getCurrentCounselor: (): Counselor | null => {
    const stored = localStorage.getItem('counselor');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('counselor');
  },
};
