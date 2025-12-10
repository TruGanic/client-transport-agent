import { useAuthStore } from '../store/auth';


export function useUser() {
return useAuthStore((state) => state.user);
}