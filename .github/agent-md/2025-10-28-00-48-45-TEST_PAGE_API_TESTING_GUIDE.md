# Test Page API Testing Guide

**Date:** 2025-01-22  
**Purpose:** Guide for testing registration APIs using the test page  
**Status:** Ready for API Integration Testing

---

## 🎯 Overview

The test page (`/test`) has been updated to facilitate API testing for the registration flow. This guide explains how to use it to test OTP sending and registration verification APIs.

---

## 🚀 Quick Start

### Access the Test Page

```bash
# Start the development server
cd nextjs
npm run dev

# Open test page in browser
http://localhost:5001/test
```

### Available Test Scenarios

| URL | Scenario | Registration Button | Modal Flow |
|-----|----------|---------------------|------------|
| `/test?scenario=valid` | ✅ Valid verification | ❌ No | N/A |
| `/test?scenario=expired` | ⏰ Expired | ❌ No | N/A |
| `/test?scenario=error` | ❌ Error | ❌ No | N/A |
| `/test?scenario=with-product` | 📦 With product info | ❌ No | N/A |
| `/test?scenario=already-registered` | 🔒 Already registered | ✅ Yes | Already Registered Modal |
| `/test?scenario=customer-not-found` | 👤 Customer not found | ✅ Yes | Registration Form Modal |
| `/test?scenario=customer-not-attach` | 🔗 Customer not attached | ✅ Yes | Registration Form Modal |

---

## 🧪 Testing Registration APIs

### Scenario 1: Already Registered

**URL:** `http://localhost:5001/test?scenario=already-registered&lang=en`

**Test Data:**
```javascript
Status: "ALREADY_REGISTERED"
Serial: "E0000076"
OrgId: "napbiotec"
RegisteredEmail: "customer@example.com"
```

**Expected Behavior:**
1. Page loads with orange warning icon
2. Registration button appears (blue button with "Register" text)
3. Click registration button
4. Modal opens showing:
   - "This product is already registered"
   - Registered email: `customer@example.com`
   - Confirm button to close

**API Calls:** None (already registered)

---

### Scenario 2: Customer Not Found (New Registration)

**URL:** `http://localhost:5001/test?scenario=customer-not-found&lang=en`

**Test Data:**
```javascript
Status: "CUSTOMER_NOTFOUND"
Serial: "E0000099"
Pin: "ABC123XY"
OrgId: "napbiotec"
```

**Expected Behavior:**

#### Step 1: Open Registration Modal
1. Page loads with appropriate status
2. Registration button appears
3. Click registration button
4. Modal opens with email input field

#### Step 2: Send OTP
1. Enter email address (e.g., `test@example.com`)
2. Click "Send OTP" button (on right side of email input)
3. **API Call:** `POST /api/otp/send` or your endpoint
   ```json
   {
     "email": "test@example.com",
     "orgId": "napbiotec",
     "serialNumber": "E0000099",
     "language": "en"
   }
   ```
4. Button shows "Sending..." loading state
5. OTP input field appears after successful send

#### Step 3: Enter OTP and Register
1. Enter 6-digit OTP code received (e.g., `123456`)
2. Click "Confirm" button
3. **API Call:** `POST /api/register/verify` or your endpoint
   ```json
   {
     "email": "test@example.com",
     "otp": "123456",
     "serialNumber": "E0000099",
     "orgId": "napbiotec"
   }
   ```
4. Modal closes on success
5. (Optional) Page should refresh to show new status

**Current Implementation Status:** ⚠️ TODO placeholders - needs API integration

---

### Scenario 3: Customer Not Attached

**URL:** `http://localhost:5001/test?scenario=customer-not-attach&lang=en`

**Test Data:**
```javascript
Status: "CUSTOMER_NOT_ATTACH"
Serial: "E0000100"
Pin: "XYZ789AB"
OrgId: "napbiotec"
```

**Expected Behavior:** Same as Scenario 2 (Customer Not Found)

---

## 🔧 How to Integrate APIs

### Current Code Location

**File:** `nextjs/components/themes/default/VerifyView.tsx`

### Placeholder 1: Send OTP (Line ~563)

**Current Code:**
```typescript
onClick={async () => {
  if (!email) return;
  setIsSendingOtp(true);
  try {
    // TODO: Call OTP API
    // await fetch('/api/send-otp', { method: 'POST', body: JSON.stringify({ email }) });
    setIsOtpSent(true);
  } catch (error) {
    console.error("Failed to send OTP:", error);
  } finally {
    setIsSendingOtp(false);
  }
}}
```

**Replace With:**
```typescript
onClick={async () => {
  if (!email) return;
  setIsSendingOtp(true);
  try {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        orgId: verifyData.scanData?.orgId || 'napbiotec',
        serialNumber: verifyData.scanData?.serial || '',
        language: lang,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }

    const data = await response.json();
    console.log('OTP sent successfully:', data);
    setIsOtpSent(true);
    
    // Optional: Show success message
    // toast.success('OTP sent to your email!');
  } catch (error) {
    console.error("Failed to send OTP:", error);
    alert(`Error: ${error.message}`);
  } finally {
    setIsSendingOtp(false);
  }
}}
```

### Placeholder 2: Register/Verify (Line ~605)

**Current Code:**
```typescript
onClick={async () => {
  if (!email || !otp) return;
  try {
    // TODO: Call registration API
    // await fetch('/api/register', { method: 'POST', body: JSON.stringify({ email, otp }) });
    setIsRegModalOpen(false);
  } catch (error) {
    console.error("Registration failed:", error);
  }
}}
```

**Replace With:**
```typescript
onClick={async () => {
  if (!email || !otp) return;
  setIsRegistering(true); // Add this state
  try {
    const response = await fetch('/api/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        otp,
        serialNumber: verifyData.scanData?.serial || '',
        orgId: verifyData.scanData?.orgId || 'napbiotec',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    console.log('Registration successful:', data);
    
    // Close modal
    setIsRegModalOpen(false);
    
    // Optional: Refresh page to show updated status
    // window.location.reload();
    
    // Optional: Show success message
    // toast.success('Registration successful!');
  } catch (error) {
    console.error("Registration failed:", error);
    alert(`Error: ${error.message}`);
  } finally {
    setIsRegistering(false);
  }
}}
```

---

## 🔍 Testing Checklist

### Pre-Testing Setup
- [ ] Backend API server is running
- [ ] Next.js dev server is running on port 5001
- [ ] Browser developer tools are open (Network tab)
- [ ] You have test email credentials ready

### Test Already Registered Flow
- [ ] Navigate to `/test?scenario=already-registered`
- [ ] Registration button appears
- [ ] Click registration button
- [ ] Modal shows registered email
- [ ] Close button works
- [ ] Test in both Thai and English

### Test New Registration Flow (Customer Not Found)
- [ ] Navigate to `/test?scenario=customer-not-found`
- [ ] Registration button appears
- [ ] Click registration button
- [ ] Modal opens with email input
- [ ] Enter valid email address
- [ ] Click "Send OTP" button
- [ ] Check Network tab for API call
- [ ] Verify request payload is correct
- [ ] Verify response is successful
- [ ] OTP input field appears
- [ ] Enter valid OTP code
- [ ] Click "Confirm" button
- [ ] Check Network tab for registration API call
- [ ] Verify request payload is correct
- [ ] Verify response is successful
- [ ] Modal closes on success
- [ ] Test in both Thai and English

### Test New Registration Flow (Customer Not Attached)
- [ ] Navigate to `/test?scenario=customer-not-attach`
- [ ] Repeat all steps from Customer Not Found test
- [ ] Verify behavior is identical

### Test Error Handling
- [ ] Test with invalid email format
- [ ] Test with empty email
- [ ] Test with incorrect OTP
- [ ] Test with expired OTP
- [ ] Test network timeout/failure scenarios
- [ ] Verify error messages display correctly

### Test Edge Cases
- [ ] Test rapid clicking on Send OTP button
- [ ] Test clicking outside modal (should close)
- [ ] Test pressing Escape key (should close)
- [ ] Test with very long email addresses
- [ ] Test with special characters in email
- [ ] Test resending OTP (if implemented)

---

## 📊 Monitoring API Calls

### Browser Developer Tools

**Network Tab:**
1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Perform registration actions
5. Check request/response details

**Console Tab:**
1. Go to Console tab
2. Look for `console.log` statements:
   - "OTP sent successfully:"
   - "Registration successful:"
3. Check for errors (red text)

**Example Network Request:**

```http
POST /api/otp/send HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "email": "test@example.com",
  "orgId": "napbiotec",
  "serialNumber": "E0000099",
  "language": "en"
}
```

**Example Network Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpExpiry": "2025-01-22T12:45:00Z"
}
```

---

## 🐛 Troubleshooting

### Issue: Registration button doesn't appear

**Possible Causes:**
- Status is not `ALREADY_REGISTERED`, `CUSTOMER_NOTFOUND`, or `CUSTOMER_NOT_ATTACH`
- Check current URL scenario parameter

**Solution:**
- Verify URL has correct `?scenario=` parameter
- Check browser console for errors

### Issue: "Send OTP" does nothing

**Possible Causes:**
- API endpoint not implemented
- CORS issues
- Backend server not running

**Solution:**
1. Check Network tab for failed requests
2. Verify backend API server is running
3. Check API endpoint URL is correct
4. Verify CORS headers are set on backend

### Issue: Modal doesn't close after registration

**Possible Causes:**
- API returns error
- Response format doesn't match expected structure

**Solution:**
1. Check Network tab for API response
2. Verify response status is 200/201
3. Check response body format matches expected

### Issue: OTP input doesn't appear

**Possible Causes:**
- `setIsOtpSent(true)` not called
- API call failed silently

**Solution:**
1. Check if OTP API call succeeded
2. Look for errors in console
3. Verify `isOtpSent` state is updated

---

## 📝 Testing Notes Template

Use this template to document your testing:

```markdown
## API Testing Session

**Date:** YYYY-MM-DD  
**Tester:** [Your Name]  
**Environment:** Development  
**API Base URL:** [Your API URL]

### Test Results

#### Scenario: Already Registered
- Status: [ ] Pass / [ ] Fail
- Notes: 

#### Scenario: Customer Not Found
- Status: [ ] Pass / [ ] Fail
- OTP Send API:
  - Response Time: ___ ms
  - Status Code: ___
  - Notes:
- Registration API:
  - Response Time: ___ ms
  - Status Code: ___
  - Notes:

#### Scenario: Customer Not Attached
- Status: [ ] Pass / [ ] Fail
- OTP Send API:
  - Response Time: ___ ms
  - Status Code: ___
  - Notes:
- Registration API:
  - Response Time: ___ ms
  - Status Code: ___
  - Notes:

### Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 
```

---

## 🔗 Related Documentation

- **API Integration Guide:** `.github/agent-md/API_INTEGRATION_GUIDE.md`
- **Implementation Summary:** `.github/agent-md/IMPLEMENTATION_SUMMARY.md`
- **Testing Checklist:** `.github/agent-md/TESTING_CHECKLIST.md`
- **Swagger API Docs:** https://api-dev.please-scan.com/swagger/index.html

---

## 🎯 Success Criteria

### API Integration Complete When:
- [ ] OTP send endpoint integrated and working
- [ ] Registration verify endpoint integrated and working
- [ ] Error handling implemented for all failure cases
- [ ] Success messages display correctly
- [ ] Loading states work properly
- [ ] All test scenarios pass
- [ ] Both Thai and English languages tested
- [ ] Mobile responsive design tested
- [ ] No console errors
- [ ] Network requests show correct payloads
- [ ] API responses handled correctly

---

## 📞 Need Help?

If you encounter issues:

1. **Check Documentation:** Review the API Integration Guide
2. **Check Swagger Docs:** Verify API endpoint signatures
3. **Check Console:** Look for JavaScript errors
4. **Check Network Tab:** Verify API requests/responses
5. **Check Backend Logs:** Look for server-side errors

---

**Last Updated:** 2025-01-22  
**Version:** 1.0  
**Status:** Ready for Use