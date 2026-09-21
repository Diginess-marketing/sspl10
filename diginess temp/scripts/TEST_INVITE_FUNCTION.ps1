$FUNCTION_URL = "https://fazpykekypcktcmniwbj.supabase.co/functions/v1/send-invite-mail"

# Actually, better to use the user's local .env file if I can read it? 
# I will just ask the user to provide it or assume it's set in the environment if they run it.
# Let's make it use the secret if available or ask input.

Write-Host "Testing Edge Function..."

# JSON Body
$body = @{
    email      = "test_debug@example.com"
    role       = "user"
    inviteLink = "http://localhost:3000/login"
} | ConvertTo-Json

# We need the Anon Key. Since I don't have it in the chat context directly (it's in .env),
# I'll create a script that reads the .env file if it exists.

Invoke-RestMethod -Uri $FUNCTION_URL -Method Post -Body $body -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $env:SUPABASE_ANON_KEY" }
