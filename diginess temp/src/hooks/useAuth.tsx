import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, DatabaseUtils } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger, StateManager } from '@/utils/logger';

interface AuthError {
  message: string;
  status?: number;
}

// Retry utility with exponential backoff
const retryWithBackoff = async function <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context: string = 'operation',
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`Auth: Attempting ${context}`, { attempt: attempt + 1, maxRetries });
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Auth: ${context} failed`, {
        attempt: attempt + 1,
        maxRetries,
        error: lastError.message,
      });

      if (attempt === maxRetries) {
        logger.error(`Auth: ${context} failed after ${maxRetries + 1} attempts`, {
          error: lastError.message,
          stack: lastError.stack,
        });
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roleLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; mobile_number?: string; referred_by?: string }) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthState: () => Promise<void>;
  userRole: string | null;
  userPermissions: string[];
  checkUserRoleInDB: (email: string) => Promise<string | null>;
  setUserAsAdmin: (email: string) => Promise<boolean>;
  forceAdminRole: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [roleLoading, setRoleLoading] = useState(true);
  const { toast } = useToast();
  const adminBootstrapRun = useRef(false);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      logger.debug('Auth: Fetching user role', { userId });

      // Use retry logic for database operations
      const result = await retryWithBackoff(async () => {
        const { data, error } = await (supabase as any)
          .from('user_roles')
          .select('role, permissions')
          .eq('user_id', userId)
          .single();

        if (error) {
          throw error;
        }

        return data;
      }, 3, 1000, 'fetchUserRole');

      if (result) {
        logger.info('Auth: User role fetched successfully', { userId, role: result.role });
        setUserRole(result.role);
        // Default to empty array if permissions is null
        setUserPermissions(Array.isArray(result.permissions) ? result.permissions : []);
      }
    } catch (error) {
      const err = error as any;
      logger.warn('Auth: Error fetching user role', { userId, error: err.message, code: err.code });

      // If no role found, check for INVITE
      if (err.code === 'PGRST116') {
        try {
          // Check if there is a pending invite for this user's email
          const { data: { user } } = await supabase.auth.getUser();

          if (user?.email) {
            const { data: invite } = await (supabase as any)
              .from('admin_invites')
              .select('*')
              .eq('email', user.email)
              .single();

            if (invite) {
              logger.info('Auth: Found pending invite for user', { email: user.email, role: invite.role });

              // Redeem invite
              await retryWithBackoff(async () => {
                // Create user role from invite
                const { error: insertError } = await (supabase as any)
                  .from('user_roles')
                  .insert({
                    user_id: userId,
                    role: invite.role,
                    permissions: invite.permissions || []
                  });

                if (insertError) throw insertError;

                // Delete invite
                await (supabase as any)
                  .from('admin_invites')
                  .delete()
                  .eq('email', user.email);

              }, 2, 500, 'redeemInvite');

              // Cast invite to any to access properties safely
              const inviteData = invite as any;
              setUserRole(inviteData.role);
              setUserPermissions(inviteData.permissions || []);
              return;
            }
          }

          await retryWithBackoff(async () => {
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ user_id: userId, role: 'user' });

            if (insertError) {
              throw insertError;
            }
          }, 2, 500, 'createDefaultUserRole');

          logger.info('Auth: Default user role created', { userId });
          setUserRole('user');
          setUserPermissions([]);
        } catch (createError) {
          logger.error('Auth: Failed to create default user role', { userId, error: createError });
          setUserRole('user'); // Set default role anyway for resilience
          setUserPermissions([]);
        }
      } else {
        logger.error('Auth: Unexpected error fetching user role', { userId, error: err.message });
        setUserRole(null);
        setUserPermissions([]);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    // Set up auth state listener with comprehensive error handling
    logger.info('Auth: Setting up auth state listener');

    const setupAuthListener = async () => {
      try {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) {
              logger.warn('Auth: Component unmounted, ignoring auth state change');
              return;
            }

            logger.debug('Auth: Auth state changed', {
              event,
              hasSession: Boolean(session),
              userId: session?.user?.id,
              timestamp: new Date().toISOString(),
            });

            try {
              // Handle token refresh errors with retry
              if (event === 'TOKEN_REFRESHED') {
                logger.info('Auth: Token refreshed successfully');
              } else if (event === 'SIGNED_OUT') {
                logger.info('Auth: User signed out');
                // Clear local state on sign out
                setSession(null);
                setUser(null);
                setUserRole(null);
                setRoleLoading(false);
                setLoading(false);
                return;
              }

              setSession(session);
              setUser(session?.user ?? null);

              // Fetch user role when session changes
              if (session?.user) {
                setRoleLoading(true);
                // DEV short-circuit for target admin in development
                if (import.meta.env.DEV && session.user.id === '374cac1d-3028-4c63-8046-f8df9c26b310') {
                  logger.debug('Auth: DEV short-circuit - setting admin role before fetch');
                  setUserRole('admin');
                  setRoleLoading(false);
                  setLoading(false);
                  return;
                }

                try {
                  await fetchUserRole(session.user.id);
                } catch (roleError) {
                  logger.error('Auth: Error fetching user role during auth state change', {
                    userId: session.user.id,
                    error: roleError,
                  });
                } finally {
                  if (isMounted) {
                    setRoleLoading(false);
                    setLoading(false); // Only set loading to false after role is fetched
                  }
                }
              } else {
                setUserRole(null);
                setUserPermissions([]);
                setRoleLoading(false);
                setLoading(false);
              }
            } catch (error) {
              logger.error('Auth: Error in auth state change handler', { event, error });
              if (isMounted) {
                setLoading(false);
                setRoleLoading(false);
              }
            }
          },
        );

        subscription = authSubscription;
      } catch (error) {
        logger.error('Auth: Error setting up auth listener', { error });
        if (isMounted) {
          setLoading(false);
          setRoleLoading(false);
        }
      }
    };

    // Check for existing session with retry logic
    const checkSession = async () => {
      if (!isMounted) return;

      try {
        logger.debug('Auth: Checking existing session');

        const { data: { session }, error } = await retryWithBackoff(
          async () => supabase.auth.getSession(),
          3,
          1000,
          'getSession',
        );

        if (!isMounted) return;

        if (error) {
          logger.error('Auth: Error getting session', { error });
          setLoading(false);
          setRoleLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setRoleLoading(true);
          // DEV short-circuit for target admin in development (during initial session check)
          if (import.meta.env.DEV && session.user.id === '374cac1d-3028-4c63-8046-f8df9c26b310') {
            logger.debug('Auth: DEV short-circuit (checkSession) - setting admin role before fetch');
            setUserRole('admin');
            setRoleLoading(false);
            setLoading(false);
          } else {
            try {
              await fetchUserRole(session.user.id);
            } catch (roleError) {
              logger.error('Auth: Error fetching user role during session check', {
                userId: session.user.id,
                error: roleError,
              });
            } finally {
              if (isMounted) {
                setRoleLoading(false);
                setLoading(false); // Only set loading to false after role is fetched
              }
            }
          }
        } else {
          setRoleLoading(false);
          setLoading(false);
        }
      } catch (error) {
        logger.error('Auth: Error in checkSession', { error });
        if (isMounted) {
          setLoading(false);
          setRoleLoading(false);
        }
      }
    };

    setupAuthListener();
    checkSession();

    return () => {
      isMounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
          logger.debug('Auth: Unsubscribed from auth state changes');
        } catch (error) {
          logger.error('Auth: Error unsubscribing from auth state', { error });
        }
      }
    };
  }, [fetchUserRole]);

  // Function to manually check user role in database
  const checkUserRoleInDB = async (email: string) => {
    try {
      logger.debug('Auth: Checking user role in database', { email });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== email) {
        logger.warn('Auth: User mismatch or not found', { email, userEmail: user?.email });
        return null;
      }

      const roleData = await DatabaseUtils.safeQuery(
        async () => {
          const result = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          return result;
        },
        'checkUserRoleInDB',
      );

      logger.info('Auth: User role checked successfully', { email, role: roleData.role });
      return roleData.role;
    } catch (error) {
      logger.error('Auth: Error checking user role in DB', { email, error });
      return null;
    }
  };

  // Function to manually set user as admin
  const setUserAsAdmin = async (email: string) => {
    try {
      logger.debug('Auth: Setting user as admin', { email });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== email) {
        logger.warn('Auth: User mismatch or not found for admin assignment', { email, userEmail: user?.email });
        return false;
      }

      // Use upsert to handle both insert and update in one operation
      await DatabaseUtils.safeUpsert(
        'user_roles',
        { user_id: user.id, role: 'admin' },
        'setUserAsAdmin',
        'user_id',
      );

      logger.info('Auth: User set as admin', { email });
      setUserRole('admin');
      return true;
    } catch (error) {
      logger.error('Auth: Error setting user as admin', { email, error });
      return false;
    }
  };


  // Force update role to admin for current user
  const forceAdminRole = async () => {
    try {
      logger.debug('Auth: Force updating role to admin');

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('Auth: No user found for force admin role');
        return false;
      }

      // Use upsert to handle both insert and update in one operation
      await DatabaseUtils.safeUpsert(
        'user_roles',
        { user_id: user.id, role: 'admin' },
        'forceAdminRole',
        'user_id',
      );

      logger.info('Auth: User role force set to admin', { userId: user.id });
      setUserRole('admin');
      return true;
    } catch (error) {
      logger.error('Auth: Error force updating to admin role', { error });
      return false;
    }
  };


  const signIn = async (email: string, password: string) => {
    try {
      logger.info('Auth: Attempting sign in', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.warn('Auth: Sign in failed', { email, error: error.message, status: error.status });
        toast({
          title: 'Sign In Failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error: { message: error.message, status: error.status } };
      }
      logger.info('Auth: Sign in successful', { email, userId: data.user?.id });
      toast({
        title: 'Success',
        description: 'Signed in successfully',
      });
      return { error: null };

    } catch (error) {
      logger.error('Auth: Unexpected error during sign-in', { email, error });
      return { error: { message: 'An unexpected error occurred', status: 500 } };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; mobile_number?: string; referred_by?: string }
  ) => {
    try {
      logger.info('Auth: Attempting sign up', { email });

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata, // Pass the fan metadata to Supabase auth
        },
      });

      if (error) {
        logger.warn('Auth: Sign up failed', { email, error: error.message, status: error.status });
        toast({
          title: 'Sign Up Failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error: { message: error.message, status: error.status } };
      }
      logger.info('Auth: Sign up successful', { email, userId: data.user?.id });
      toast({
        title: 'Success',
        description: 'Please check your email to confirm your account',
      });
      return { error: null };

    } catch (error) {
      logger.error('Auth: Unexpected error during sign-up', { email, error });
      return { error: { message: 'An unexpected error occurred', status: 500 } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      logger.info('Auth: Attempting Google Sign In');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        logger.error('Auth: Google Sign In error', { error });
        toast({
          title: 'Google Sign In Failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      logger.error('Auth: Unexpected error during Google Sign In', { error });
    }
  };

  const signOut = async () => {
    try {
      logger.info('Auth: Signing out user');

      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);

      logger.info('Auth: User signed out successfully');
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully',
      });
    } catch (error) {
      logger.error('Auth: Error signing out', { error });
    }
  };

  // Utility function to clear auth state (useful for refresh token issues)
  const clearAuthState = async () => {
    try {
      logger.info('Auth: Clearing auth state');

      // Clear Supabase auth storage
      await supabase.auth.signOut({ scope: 'local' });

      // Clear local state
      setUser(null);
      setSession(null);
      setUserRole(null);
      setRoleLoading(false);
      setLoading(false);

      // Clear browser storage using StateManager
      StateManager.clearAuthStorage();

      logger.info('Auth: Auth state cleared successfully');

      toast({
        title: 'Auth State Cleared',
        description: 'Please sign in again',
      });
    } catch (error) {
      logger.error('Auth: Error clearing auth state', { error });
    }
  };

  // Consolidated DEV-only admin setup with proper state management
  useEffect(() => {
    let isMounted = true;

    const setupDevAdmin = async () => {
      if (!import.meta.env.DEV) return;
      if (adminBootstrapRun.current) return;
      if (!user) return;

      try {
        adminBootstrapRun.current = true;
        logger.debug('Auth: Starting DEV admin setup', { userId: user.id });

        // Check if any admins exist
        const existingAdmins = await DatabaseUtils.safeSelect(
          'user_roles',
          'user_id, role',
          { role: 'admin' },
          'checkExistingAdmins',
        );

        if (!existingAdmins || existingAdmins.length === 0) {
          logger.info('Auth: No admins found, bootstrapping current user as admin (DEV only)');

          // Use upsert to handle both insert and update
          await DatabaseUtils.safeUpsert(
            'user_roles',
            { user_id: user.id, role: 'admin' },
            'bootstrapAdminRole',
            'user_id',
          );

          if (isMounted) {
            setUserRole('admin');
            setRoleLoading(false);
            setLoading(false);
          }
          logger.info('Auth: Admin bootstrap completed - current user set as admin');
        } else {
          logger.debug('Auth: Admin already exists - bootstrap not needed');
        }
      } catch (err) {
        logger.error('Auth: Admin bootstrap unexpected error', { error: err });
        // Fail-open in DEV to unblock UI
        if (isMounted) {
          setUserRole('admin');
          setRoleLoading(false);
          setLoading(false);
        }
      }
    };

    const forceTargetAdmin = async () => {
      if (!import.meta.env.DEV) return;

      const targetAdminId = '374cac1d-3028-4c63-8046-f8df9c26b310';
      if (!user || user.id !== targetAdminId) return;

      try {
        logger.debug('Auth: Forcing admin role for target user (DEV only)', { targetAdminId });

        // Use upsert to handle both insert and update
        await DatabaseUtils.safeUpsert(
          'user_roles',
          { user_id: targetAdminId, role: 'admin' },
          'forceTargetAdminRole',
          'user_id',
        );

        // Ensure UI proceeds in DEV even if DB encountered warnings
        if (isMounted) {
          setUserRole('admin');
          setRoleLoading(false);
          setLoading(false);
        }
        logger.info('Auth: Target user elevated to admin (DEV only)');
      } catch (err) {
        logger.error('Auth: Force admin unexpected error', { error: err });
        // Fail-open in DEV to unblock UI and initial fetch timing
        if (isMounted) {
          setUserRole('admin');
          setRoleLoading(false);
          setLoading(false);
        }
      }
    };

    // Run both admin setup functions
    setupDevAdmin();
    forceTargetAdmin();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const hasPermission = (permission: string) => {
    // Admins have all permissions implicitly
    if (userRole === 'admin') return true;
    return userPermissions.includes(permission);
  };

  const value = {
    user,
    session,
    loading,
    roleLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearAuthState,
    userRole,
    userPermissions,
    checkUserRoleInDB,
    setUserAsAdmin,
    forceAdminRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
