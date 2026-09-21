import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
    created_at?: string;
    last_sign_in_at?: string;
    full_name?: string;
}

export interface AdminInvite {
    email: string;
    role: string;
    permissions: string[];
    created_at: string;
    status: string;
}

export interface AdminReward {
    id: string;
    title: string;
    description: string;
    points_cost: number;
    is_active: boolean;
    image_url?: string;
}

export interface SystemSettings {
    id: string;
    config_key: string;
    content: any;
    updated_at: string;
}

export const adminService = {
    // User Management
    async getUsers(page = 1, limit = 10, search = ''): Promise<{ data: AdminUser[]; count: number }> {
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = (supabase as any)
                .from('user_roles')
                .select(`
          user_id,
          role,
          permissions,
          created_at,
          user_profiles:user_id (
            full_name,
            avatar_url
          )
        `, { count: 'exact' });

            // Add search if implemented with a materialized view or specific text search column in db
            // if (search) { query = query.textSearch('email', search); }

            const { data, error, count } = await query
                .range(from, to)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to flat structure
            const formattedData = data.map((item: any) => ({
                id: item.user_id,
                role: item.role,
                permissions: item.permissions || [],
                created_at: item.created_at,
                full_name: item.user_profiles?.[0]?.full_name || 'N/A',
                // Email would typically come from auth.users which isn't directly queryable here 
                // without an edge function secure wrapper. We'll use ID or profile data for now.
                email: 'Hidden (Requires Admin API)',
            }));

            return { data: formattedData, count: count || 0 };
        } catch (error) {
            console.error('AdminService: Get users failed', error);
            throw error;
        }
    },

    async updateUserRole(userId: string, newRole: string, permissions: string[] = []) {
        // Cast to any to bypass strict enum typing if the DB type is restricted
        const roleValue = newRole as "admin" | "user";

        const { error } = await supabase
            .from('user_roles')
            .upsert({
                user_id: userId,
                role: roleValue,
                permissions: permissions
            });

        if (error) throw error;
        return true;
    },

    // inviteUser
    async inviteUser(email: string, role: string, permissions: string[]) {
        const { error } = await (supabase as any)
            .from('admin_invites')
            .insert({
                email,
                role,
                permissions,
                status: 'pending'
            });

        if (error) throw error;
        return true;
    },

    async getInvites() {
        const { data, error } = await (supabase as any)
            .from('admin_invites')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as AdminInvite[];
    },

    async deleteInvite(email: string) {
        const { error } = await (supabase as any)
            .from('admin_invites')
            .delete()
            .eq('email', email);

        if (error) throw error;
        return true;
    },

    // Rewards Management
    async getRewards() {
        const { data, error } = await (supabase as any)
            .from('rewards')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as AdminReward[];
    },

    async createReward(reward: Partial<AdminReward>) {
        const { data, error } = await (supabase as any)
            .from('rewards')
            .insert(reward)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateReward(id: string, updates: Partial<AdminReward>) {
        const { data, error } = await (supabase as any)
            .from('rewards')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteReward(id: string) {
        const { error } = await (supabase as any)
            .from('rewards')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // System Settings
    async getSettings(key: string) {
        const { data, error } = await (supabase as any)
            .from('admin_settings')
            .select('*')
            .eq('config_key', key)
            .single();

        // Return null if not found instead of throwing
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async updateSettings(key: string, content: any) {
        const { data, error } = await (supabase as any)
            .from('admin_settings')
            .upsert(
                { config_key: key, content, updated_at: new Date().toISOString() },
                { onConflict: 'config_key' }
            )
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
