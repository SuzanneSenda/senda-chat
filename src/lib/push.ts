import webpush from 'web-push';

// VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BCsw-fS9IvCyazprf7GoljG8ZFD7siunFz_rgfB66EmClp4XEA1Gu4i1KnWZmy7jERvpNUyCL3H26LUCm63U0YU';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'XRPOBTJ5taiMrkFkgCj0H5S4Q4Wfo3VGajpFEXTbA1w';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:sendachat247@gmail.com';

// Configure web-push
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
      {
        TTL: 60 * 60, // 1 hour
        urgency: 'high',
      }
    );
    return true;
  } catch (error: any) {
    console.error('Push notification error:', error);
    
    // If subscription is invalid, return false
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('Push subscription expired or invalid');
      return false;
    }
    
    return false;
  }
}

export { webpush };
