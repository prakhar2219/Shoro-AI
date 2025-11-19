'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Globe, Settings, Database, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Education AI Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Admin Dashboard & Content Management System
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Admin Panel
              </CardTitle>
              <CardDescription>Access the admin dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full">Go to Admin</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Content Management
              </CardTitle>
              <CardDescription>Manage educational content</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/countries">
                <Button variant="outline" className="w-full">Manage Content</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                User Management
              </CardTitle>
              <CardDescription>Manage users and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              About This Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">
              This is the backend administration panel for the Education AI Platform.
            </p>
            <p className="mb-4">
              Use the admin dashboard to manage educational content, including countries, boards, classes, subjects, chapters, topics, and all related content.
            </p>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button size="sm">Open Dashboard</Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" size="sm">Settings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
