'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This page requires special permissions that your account doesn't have.
            Please contact your administrator if you believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={() => router.back()} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link href="/" className="w-full">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
