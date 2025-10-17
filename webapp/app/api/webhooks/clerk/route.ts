import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook events
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Sync user to your backend
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/clerk-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: id,
          email: email_addresses[0]?.email_address,
          name: `${first_name} ${last_name}`.trim(),
          profileImage: image_url,
          role: 'user', // Default role
        }),
      });
    } catch (error) {
      console.error('Error syncing user to backend:', error);
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Update user in your backend
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/clerk-sync`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: id,
          email: email_addresses[0]?.email_address,
          name: `${first_name} ${last_name}`.trim(),
          profileImage: image_url,
        }),
      });
    } catch (error) {
      console.error('Error updating user in backend:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    // Delete or deactivate user in your backend
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/clerk-sync/${id}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error) {
      console.error('Error deleting user in backend:', error);
    }
  }

  return new Response('', { status: 200 });
}
