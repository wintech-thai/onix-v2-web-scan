// Check the actual backend URL patterns from test data

import fs from 'fs';

console.log("🔍 Checking Backend URL Patterns");
console.log("==================================\n");

// Read the test page to see what URLs are returned
const testPageContent = fs.readFileSync('./app/test/page.tsx', 'utf-8');

console.log("Looking for requestOtpViaEmailUrl pattern...\n");

// Search for requestOtpViaEmailUrl in test data
const otpUrlMatch = testPageContent.match(/requestOtpViaEmailUrl['":\s]+([^'"]+)/);

if (otpUrlMatch) {
  console.log("Found pattern:", otpUrlMatch[1]);
} else {
  console.log("Pattern not found in test page, checking for mock data...");
}

// Look for the actual pattern structure
const getOtpMatch = testPageContent.match(/GetOtpViaEmail[^'"]+/);
if (getOtpMatch) {
  console.log("\nGetOtpViaEmail pattern:", getOtpMatch[0]);
}

// Check VerifyView for how it's used
const verifyViewContent = fs.readFileSync('./components/themes/default/VerifyView.tsx', 'utf-8');

console.log("\n\nHow VerifyView uses requestOtpViaEmailUrl:");
console.log("==========================================");

const otpUsage = verifyViewContent.match(/requestOtpViaEmailUrl[\s\S]{0,300}/);
if (otpUsage) {
  console.log(otpUsage[0].substring(0, 400));
}

console.log("\n\nExpected URL pattern from your description:");
console.log("==========================================");
console.log("/org/{id}/GetOtpViaEmail/{serial}/{pin}/{otp}/{email}");
console.log("\nParameters:");
console.log("  {id}     - Organization ID");
console.log("  {serial} - Serial number");
console.log("  {pin}    - PIN code");
console.log("  {otp}    - OTP session/reference code");
console.log("  {email}  - User's email address (placeholder to be replaced)");
