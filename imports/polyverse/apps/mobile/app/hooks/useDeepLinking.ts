import { useEffect } from 'react';
import { Linking } from 'react-native';
import * as LinkingExpo from 'expo-linking';
import { useRouter } from 'expo-router';

export function useDeepLinking() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = LinkingExpo.addEventListener('url', (event: { url: string }) => {
      handleDeepLink(event.url);
    });

    // Handle deep links when app is opened from a cold start
    LinkingExpo.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  const handleDeepLink = (url: string) => {
    const parsedUrl = LinkingExpo.parse(url);
    
    // Handle polyverse:// scheme
    if (parsedUrl.scheme === 'polyverse') {
      const path = parsedUrl.hostname + (parsedUrl.path || '');
      
      // Map deep link paths to app routes
      const routeMap: Record<string, string> = {
        'shorts': '/shorts',
        'truth': '/truth',
        'profile': '/profile',
        'create': '/create',
      };

      // Handle specific content deep links
      if (parsedUrl.queryParams?.shortId) {
        router.push(`/shorts/${parsedUrl.queryParams.shortId}` as any);
      } else if (parsedUrl.queryParams?.claimId) {
        router.push(`/truth/${parsedUrl.queryParams.claimId}` as any);
      } else if (parsedUrl.queryParams?.userId) {
        router.push(`/profile/${parsedUrl.queryParams.userId}` as any);
      } else if (path && routeMap[path]) {
        router.push(routeMap[path] as any);
      } else {
        // Default to shorts feed
        router.push('/shorts' as any);
      }
    }
    
    // Handle universal links (https://polyverse.social)
    else if (parsedUrl.hostname === 'polyverse.social') {
      const path = parsedUrl.path || '';
      
      if (path.startsWith('/shorts/')) {
        const shortId = path.split('/')[2];
        router.push(`/shorts/${shortId}` as any);
      } else if (path.startsWith('/truth/')) {
        const claimId = path.split('/')[2];
        router.push(`/truth/${claimId}` as any);
      } else if (path.startsWith('/profile/')) {
        const userId = path.split('/')[2];
        router.push(`/profile/${userId}` as any);
      } else {
        // Default to shorts feed
        router.push('/shorts' as any);
      }
    }
  };

  const generateDeepLink = (type: 'short' | 'claim' | 'user', id: string): string => {
    const baseUrl = 'https://polyverse.social';
    
    switch (type) {
      case 'short':
        return `${baseUrl}/shorts/${id}`;
      case 'claim':
        return `${baseUrl}/truth/${id}`;
      case 'user':
        return `${baseUrl}/profile/${id}`;
      default:
        return baseUrl;
    }
  };

  const generateAppDeepLink = (type: 'short' | 'claim' | 'user', id: string): string => {
    switch (type) {
      case 'short':
        return `polyverse://shorts?shortId=${id}`;
      case 'claim':
        return `polyverse://truth?claimId=${id}`;
      case 'user':
        return `polyverse://profile?userId=${id}`;
      default:
        return 'polyverse://shorts';
    }
  };

  const shareContent = async (type: 'short' | 'claim' | 'user', id: string, title: string) => {
    const deepLink = generateDeepLink(type, id);
    const appLink = generateAppDeepLink(type, id);
    
    const shareMessage = `${title}\n\nOpen in PolyVerse:\n${deepLink}\n\nOr use the app: ${appLink}`;
    
    // In a real app, you would use expo-sharing here
    // For now, we'll just return the share message
    return shareMessage;
  };

  return {
    generateDeepLink,
    generateAppDeepLink,
    shareContent,
  };
}