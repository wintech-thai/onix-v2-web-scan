# Testing Checklist - Post Bug Fix

**Date:** 2025-01-22  
**Version:** 2.0.0  
**Purpose:** Verify application functionality after useState bug fix

---

## ✅ Pre-Testing Setup

- [ ] Navigate to project directory: `cd onix-v2-web-scan/nextjs`
- [ ] Install dependencies (if needed): `npm install`
- [ ] Start development server: `npm run dev`
- [ ] Verify server starts on port 5001 without errors
- [ ] Check terminal output for compilation success

**Expected Output:**
```
✓ Ready in ~1200ms
✓ Compiled /middleware in ~140ms
- Local: http://localhost:5001
```

---

## ✅ Core Functionality Tests

### 1. Basic Application Startup
- [ ] ✅ Application starts without errors
- [ ] ✅ No TypeScript compilation errors
- [ ] ✅ No React/Next.js errors in terminal
- [ ] ✅ Middleware compiles successfully
- [ ] ✅ Port 5001 is accessible

### 2. Verify Page Loading
- [ ] Navigate to `/verify` with test data URL
- [ ] Page loads without 500 error
- [ ] No "useState only works in Client Components" error
- [ ] Header displays "Please Scan Verify" title
- [ ] Page renders correctly

**Test URL Pattern:**
```
http://localhost:5001/verify?data=[encrypted-data]&theme=default&org=napbiotec&lang=en
```

### 3. Hamburger Menu Functionality
- [ ] Hamburger icon (☰) visible in header
- [ ] Click opens menu panel from right
- [ ] Menu slides in smoothly with animation
- [ ] Backdrop overlay appears
- [ ] Body scroll is prevented when menu is open

### 4. Menu Interaction
- [ ] Click "ไทย" (Thai) option - page reloads with `?lang=th`
- [ ] Click "English" option - page reloads with `?lang=en`
- [ ] Active language is highlighted (blue background)
- [ ] Language checkmark (✓) shows for selected language
- [ ] Privacy Policy link opens in new tab
- [ ] Click X button closes menu
- [ ] Click outside overlay closes menu
- [ ] Body scroll restored after menu closes

### 5. Language Switching
- [ ] Thai language displays correctly (`lang=th`)
  - [ ] Header title in Thai
  - [ ] Menu items in Thai
  - [ ] Privacy link in Thai
- [ ] English language displays correctly (`lang=en`)
  - [ ] Header title in English
  - [ ] Menu items in English
  - [ ] Privacy link in English

---

## ✅ Verification Status Tests

### 6. Status: ALREADY_REGISTERED
- [ ] Main status icon displays correctly
- [ ] Status title shows warning message
- [ ] Registration button appears
- [ ] Click registration button opens "Already Registered" modal
- [ ] Modal shows registered email address
- [ ] Close button works

### 7. Status: CUSTOMER_NOT_ATTACH / CUSTOMER_NOTFOUND
- [ ] Main status icon displays correctly
- [ ] Registration button appears
- [ ] Click registration button opens registration form modal
- [ ] Email input field visible
- [ ] "Send OTP" button visible (right side of email input)
- [ ] OTP input initially hidden
- [ ] Cancel button closes modal

### 8. Status: SUCCESS / VALID
- [ ] Green success icon displays
- [ ] Success message shows
- [ ] Confetti animation plays (optional check)
- [ ] All data displays correctly

### 9. Other Status Codes
- [ ] ERROR status shows red icon and error message
- [ ] Registration button does NOT appear for other statuses

---

## ✅ Registration Flow Tests (UI Only - API Not Integrated)

### 10. Registration Form Modal
- [ ] Email input accepts text
- [ ] Email validation (basic format check)
- [ ] "Send OTP" button enabled when email valid
- [ ] Click "Send OTP" shows loading state
- [ ] OTP input appears after sending (simulated)
- [ ] OTP input accepts 6-digit code
- [ ] Confirm button enabled when both fields filled
- [ ] Cancel button closes modal and resets form

**Note:** API calls are placeholder TODOs - will show console errors or alerts

---

## ✅ Responsive Design Tests

### 11. Desktop View (≥1024px)
- [ ] Header spans full width
- [ ] Hamburger menu works correctly
- [ ] Menu panel slides from right
- [ ] Content centered properly
- [ ] No horizontal scroll

### 12. Tablet View (768px - 1023px)
- [ ] Layout adjusts appropriately
- [ ] Menu panel width adjusts (max 85vw)
- [ ] Touch interactions work
- [ ] All buttons accessible

### 13. Mobile View (<768px)
- [ ] Header stacks correctly
- [ ] Hamburger menu easily clickable
- [ ] Menu panel covers most of screen
- [ ] Text readable without zoom
- [ ] Modals display properly

---

## ✅ Browser Compatibility Tests

### 14. Chrome/Edge (Chromium)
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### 15. Firefox
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### 16. Safari (macOS/iOS)
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors
- [ ] Touch events work (iOS)

---

## ✅ Accessibility Tests

### 17. Keyboard Navigation
- [ ] Tab through hamburger button
- [ ] Enter/Space opens menu
- [ ] Tab through menu items
- [ ] Escape closes menu
- [ ] Focus visible on all interactive elements

### 18. Screen Reader
- [ ] Hamburger button has aria-label="Menu"
- [ ] Menu panel has proper ARIA attributes
- [ ] Language options readable
- [ ] Modal dialogs announced correctly

---

## ✅ Performance Tests

### 19. Load Time
- [ ] Initial page load < 2 seconds
- [ ] Menu opens instantly (<300ms)
- [ ] No layout shift on load
- [ ] Images load progressively

### 20. Console Checks
- [ ] No errors in browser console
- [ ] No warnings (except expected dev warnings)
- [ ] No network errors (404/500)
- [ ] No memory leaks

---

## ✅ Edge Cases & Error Handling

### 21. Missing Parameters
- [ ] Missing `data` parameter handled gracefully
- [ ] Missing `org` parameter handled gracefully
- [ ] Invalid `lang` parameter defaults to Thai
- [ ] Invalid `theme` parameter defaults to 'default'

### 22. Network Issues
- [ ] Decryption failure shows error state
- [ ] Invalid data format handled gracefully
- [ ] Error messages display in correct language

### 23. Long Content
- [ ] Long product names don't break layout
- [ ] Long email addresses display correctly
- [ ] Scrolling works in modals if content overflows

---

## ✅ Integration Points (Placeholder Check)

### 24. API Endpoints (Not Yet Integrated)
- [ ] TODO markers present in code
- [ ] Console logs indicate placeholder API calls
- [ ] Error handling structure in place
- [ ] Ready for real API integration

**Files to update when integrating APIs:**
- `nextjs/components/themes/default/VerifyView.tsx` (handleSendOtp, handleRegister)
- Create `nextjs/lib/api.ts` for API helper functions
- Update environment variables for API URLs

---

## ✅ Production Readiness

### 25. Environment Variables
- [ ] `.env.local` configured correctly
- [ ] PORT set to 5001
- [ ] Encryption keys configured
- [ ] Redis config (optional) set

### 26. Build Test
```bash
npm run build
npm run start
```
- [ ] Build completes without errors
- [ ] Production build runs on port 5001
- [ ] All features work in production mode
- [ ] No build warnings

---

## 🐛 Known Issues / Limitations

1. **API Integration Pending**: Registration OTP and verify endpoints not yet connected
2. **Placeholder Alerts**: Uses `alert()` for errors - should replace with toast notifications
3. **Email Validation**: Basic format check only - needs backend validation
4. **OTP Resend**: No countdown timer or resend functionality yet
5. **Success Flow**: After registration, page doesn't auto-refresh verification result

**See:** `API_INTEGRATION_GUIDE.md` for implementation steps

---

## 📋 Test Results Summary

**Date Tested:** __________  
**Tester:** __________  
**Browser:** __________  
**Device:** __________

**Overall Status:**
- [ ] ✅ All tests passed
- [ ] ⚠️ Minor issues found (list below)
- [ ] ❌ Critical issues found (list below)

**Issues Found:**
1. _______________________________________
2. _______________________________________
3. _______________________________________

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

## 🚀 Sign-Off

Once all tests pass:
- [ ] Development environment verified
- [ ] Production build tested
- [ ] Documentation reviewed
- [ ] Ready for API integration
- [ ] Ready for user acceptance testing (UAT)

**Approved by:** __________  
**Date:** __________

---

## 📚 Related Documentation

- `.github/BUG_FIX_USESTATE_ERROR.md` - Bug fix details
- `.github/IMPLEMENTATION_SUMMARY.md` - Complete implementation overview
- `API_INTEGRATION_GUIDE.md` - API integration steps
- `README_UI_UPDATES.md` - UI changes documentation

---

**Remember:** This is a development testing checklist. Additional testing required before production deployment!