gifterra-next-web-app
This is a Gifterra Web app's Front end, which is build on Next.js

## Supabase authentication

The public landing page is at `/`. The active product catalog and product details are public; cart and orders require a signed-in user. The app supports email/password sign-up, sign-in, email confirmation, and sign-out using Supabase Auth.

1. In Supabase, enable the Email provider under **Authentication → Sign In / Providers**.
2. Under **Authentication → URL Configuration**, keep the app URL as the Site URL and add `http://localhost:3000/auth/callback` to the Redirect URLs.
3. Add the project URL and publishable key to the root `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Restart the development server after changing environment variables.

When deploying, add the deployed site's `/auth/callback` URL to Supabase's Redirect URLs. The app uses only the publishable key; never expose a service-role key in browser code or commit credentials.

## Product catalog and admin panel

The catalog is read from `public.products`; product images are stored in the public `product-images` Storage bucket. Anyone can read active products. Only accounts whose trusted `auth.users.raw_app_meta_data.role` is `admin` can manage products or upload/delete images. The bucket is public so storefront images can load without a signed-in image request; uploads and changes remain admin-only.

### Supabase setup

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Open [`supabase/schema.sql`](./supabase/schema.sql), copy its contents into the SQL Editor, and run it. This creates the products table, row-level security policies, the admin-role check, and the image bucket. Run the script again after app updates that change the schema or policies; it is safe to re-run.
3. Sign up in the app using the account you want to administer and confirm its email.
4. In the Supabase SQL Editor, grant that account the admin role. Replace the example email with the exact email used to sign up:

   ```sql
   update auth.users
   set raw_app_meta_data =
     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'you@example.com';
   ```

   Confirm one user was updated. Sign out and sign back in so Supabase issues a token with the new role. The **Admin** link will appear in the app navigation; the panel is at `/admin`.
5. Add products in the panel. The name, description, price, and product image are required. Tags are comma-separated; the badge, rating, and visibility are optional.

The SQL Editor is an administrative dashboard tool; do not place database passwords or service-role/secret keys in the app or send them in chat. To revoke admin access, run:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
where email = 'you@example.com';
```


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Startedfhfhfhfh

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
