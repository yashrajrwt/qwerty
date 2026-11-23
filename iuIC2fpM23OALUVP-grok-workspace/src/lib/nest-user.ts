import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isPlatformViewerEmail } from "@/lib/nest-identity";

export {
  isNestMember,
  isPlatformViewerEmail,
  rememberNestSession,
  VIEWER_EMAIL_DOMAIN,
} from "@/lib/nest-identity";

export function useNestUser() {
  const { user, isPending } = useCurrentUserState();
  if (isPlatformViewerEmail(user?.primaryEmail)) {
    return { user: null, isPending, platformViewer: true as const };
  }
  return { user, isPending, platformViewer: false as const };
}
