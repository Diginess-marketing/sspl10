$env:AZURE_TENANT_ID="98c6c39a-2b35-49a5-9108-7ec8c544c802"
$env:AZURE_CLIENT_ID="f44441c1-1ad2-4e0a-a70e-12fa4b76e0eb"
$env:AZURE_CLIENT_SECRET="B928Q~l-_5joIIcQQdlc5qcYc.O9lSVChLJtnbwy"
$env:AZURE_SENDER_EMAIL="hello@ssplt10.co.in"
$env:AZURE_SENDER_NAME="SSPL T10 Admin"

echo "Setting Supabase Secrets..."

npx supabase secrets set AZURE_TENANT_ID=$env:AZURE_TENANT_ID
npx supabase secrets set AZURE_CLIENT_ID=$env:AZURE_CLIENT_ID
npx supabase secrets set AZURE_CLIENT_SECRET=$env:AZURE_CLIENT_SECRET
npx supabase secrets set AZURE_SENDER_EMAIL=$env:AZURE_SENDER_EMAIL
npx supabase secrets set AZURE_SENDER_NAME=$env:AZURE_SENDER_NAME

echo "Secrets set successfully!"
echo "Now deploy the function with: npx supabase functions deploy send-invite-mail --no-verify-jwt"
