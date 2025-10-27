# Set up pager to null
$env:GIT_PAGER = "cat"

Write-Host "=== Staging all changes ===" -ForegroundColor Cyan
git add -A

Write-Host "=== Creating commit ===" -ForegroundColor Cyan
git commit -m "feat: Add authentication to all API routes and cleanup codebase

- Add Clerk authentication to content, blog, upload, and rating routes
- Implement role-based access control (super_admin, admin, editor)
- Remove JWT authentication completely, use Clerk only
- Remove client-facing routes and components, keep only admin panel
- Update error messages to be user-friendly
- Fix import path in content routes
- Update metadata for admin panel
- Improve Webpack configuration"

Write-Host "=== Pushing to final branch ===" -ForegroundColor Cyan
git push origin final

Write-Host "=== Done! ===" -ForegroundColor Green
