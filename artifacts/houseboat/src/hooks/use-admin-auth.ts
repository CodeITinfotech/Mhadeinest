import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useAdminLogout } from "@workspace/api-client-react";

export function useAdminAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  });

  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
    }
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout: () => logoutMutation.mutate({}),
    isLoggingOut: logoutMutation.isPending
  };
}
