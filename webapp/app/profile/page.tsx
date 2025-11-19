"use client"

import { useClerkAuthAdapter } from "@/hooks/useClerkAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, User, Shield, Calendar, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useClerkAuthAdapter()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/sign-in')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </CardDescription>
                <div className="mt-2">
                  <Badge variant="outline" className="capitalize">
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <User className="w-5 h-5 mr-3 mt-0.5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Full Name
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.name}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start">
              <Mail className="w-5 h-5 mr-3 mt-0.5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Email Address
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start">
              <Shield className="w-5 h-5 mr-3 mt-0.5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Role
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start">
              <Calendar className="w-5 h-5 mr-3 mt-0.5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Account Created
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {user.lastLogin && (
              <>
                <Separator />
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-3 mt-0.5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Last Sign In
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.lastLogin)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Other account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  User ID
                </p>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {user._id}
                </code>
              </div>
              
              {user.phoneNumber && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Phone Number
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.phoneNumber}
                    </p>
                  </div>
                </>
              )}
              
              {user.department && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Department
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.department}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
