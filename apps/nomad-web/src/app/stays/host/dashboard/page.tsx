
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ConnectAccountStatus {
  accountId?: string;
  status?: 'pending' | 'active' | 'restricted' | 'rejected';
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
  details_submitted: boolean;
  payouts_enabled: boolean;
  charges_enabled: boolean;
}

export default function HostDashboard() {
  const { data: session, status } = useSession();
  const [connectStatus, setConnectStatus] = useState<ConnectAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchConnectStatus();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    } else if (status === 'loading') {
      // Still loading, wait for session
      const timer = setTimeout(() => {
        setLoading(false);
      }, 5000); // 5 second timeout
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchConnectStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect-status');
      if (response.ok) {
        const data = await response.json();
        setConnectStatus(data);
      }
    } catch (error) {
      console.error('Error fetching Connect status:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConnectAccount = async () => {
    setCreatingAccount(true);
    try {
      const response = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: 'US',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe onboarding
        window.location.href = `/api/stripe/create-account-link?accountId=${data.accountId}`;
      } else {
        console.error('Failed to create Connect account');
      }
    } catch (error) {
      console.error('Error creating Connect account:', error);
    } finally {
      setCreatingAccount(false);
    }
  };

  const getOnboardingLink = async (accountId: string) => {
    try {
      const response = await fetch(`/api/stripe/create-account-link?accountId=${accountId}`);
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error getting onboarding link:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Host Dashboard</h1>
          <p className="text-gray-600 mb-4">Please sign in to access the host dashboard.</p>
          <Link href="/auth/signin" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Host Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome back, {session?.user?.name || session?.user?.email}!</p>
        
        {/* Connect Account Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Stripe Connect Setup</h2>
          
          {!connectStatus?.accountId ? (
            <div>
              <p className="text-gray-600 mb-4">
                Set up your Stripe Connect account to start receiving payouts for your listings.
              </p>
              <button
                onClick={createConnectAccount}
                disabled={creatingAccount}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingAccount ? 'Creating account...' : 'Set up Payouts'}
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="font-medium capitalize">{connectStatus.status || 'pending'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payouts Enabled</p>
                  <p className={connectStatus.payouts_enabled ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {connectStatus.payouts_enabled ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Charges Enabled</p>
                  <p className={connectStatus.charges_enabled ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {connectStatus.charges_enabled ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Details Submitted</p>
                  <p className={connectStatus.details_submitted ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                    {connectStatus.details_submitted ? 'Complete' : 'Pending'}
                  </p>
                </div>
              </div>

              {connectStatus.requirements && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Requirements:</p>
                  {connectStatus.requirements.currently_due.length > 0 && (
                    <div className="text-sm text-red-600">
                      <p>Currently due: {connectStatus.requirements.currently_due.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {!connectStatus.details_submitted && (
                <button
                  onClick={() => getOnboardingLink(connectStatus.accountId!)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Complete Onboarding
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/stays/host/listings"
            className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold mb-2">My Listings</h3>
            <p className="text-sm text-gray-600">Manage your properties</p>
          </Link>

          <Link
            href="/stays/host/bookings"
            className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold mb-2">Bookings</h3>
            <p className="text-sm text-gray-600">View upcoming reservations</p>
          </Link>

          <Link
            href="/stays/host/payouts"
            className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold mb-2">Payouts</h3>
            <p className="text-sm text-gray-600">Track your earnings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
