#!/bin/bash

# Deploy the admin-delete-user Edge Function to Supabase
echo "🚀 Deploying admin-delete-user Edge Function..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Deploy the function
echo "📦 Deploying function..."
supabase functions deploy admin-delete-user --project-ref eekajmfvqntbloqgizwk

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
    echo ""
    echo "🔧 Next steps:"
    echo "1. The function is now available at: https://eekajmfvqntbloqgizwk.supabase.co/functions/v1/admin-delete-user"
    echo "2. Make sure the SUPABASE_SERVICE_ROLE_KEY is set in your Supabase project secrets"
    echo "3. Test the user deletion functionality"
    echo ""
    echo "🔐 Security Note:"
    echo "This function requires admin authentication and uses the service role key securely on the server side."
else
    echo "❌ Failed to deploy Edge Function"
    echo "Please check your Supabase CLI configuration and try again"
    exit 1
fi
