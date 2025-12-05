# Contact Support Feature Implementation

**Status:** ✅ Completed  
**Created:** 2024-01-XX  
**Priority:** High  

## Overview

Implemented the missing "Contact Support" functionality that was referenced in the original C# application but never actually implemented. When users encounter verification errors or warnings, they can now click the "Contact Support" button to access a dedicated support page with their verification details pre-filled.

---

## Problem Statement

### Original Issue

In the original C# code (`Verify.cshtml`), the Contact Support button was defined as:

```csharp
var primaryHref = isSuccess
  ? (encodedProductUrl is null ? "#" : Url.Action("OpenExternal", "Verify", new { u = encodedProductUrl }))
  : Url.Action("ContactSupport", "Verify", new { serial = s?.Serial, pin = s?.Pin, brand = s?.OrgId });
```

However, the `ContactSupport` action was **never implemented** in `VerifyController.cs`.

### Next.js Issue

In the Next.js version, the button existed in the UI (`VerifyView.tsx`) but had:
- ✅ Visual styling and hover effects
- ❌ **No onClick handler** - clicking did nothing

---

## Solution Implemented

### 1. Added onClick Handler to Contact Support Button

**File:** `nextjs/components/themes/default/VerifyView.tsx`

```typescript
<button
  type="button"
  onClick={() => {
    const params = new URLSearchParams();
    if (verifyData.scanData?.serialNumber) {
      params.set("serial", verifyData.scanData.serialNumber);
    }
    if (verifyData.scanData?.pin) {
      params.set("pin", verifyData.scanData.pin);
    }
    if (verifyData.scanData?.orgId) {
      params.set("brand", verifyData.scanData.orgId);
    }
    params.set("lang", lang);
    window.location.href = `/contact-support?${params.toString()}`;
  }}
  className="w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors mb-4 border-0 cursor-pointer"
  // ... styling
>
  <span className="inline-flex items-center justify-center gap-2">
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2M20 16H5.2L4 17.2V4H20V16M11 5H13V11H11V5M11 13H13V15H11V13Z" />
    </svg>
    {t.labels.contactSupport}
  </span>
</button>
```

**Features:**
- Extracts serial, pin, and orgId from verification data
- Passes current language for bilingual support
- Navigates to `/contact-support` with query parameters
- Added support icon (chat bubble with info icon)
- Added `cursor-pointer` class for better UX

---

### 2. Created Contact Support Page

**File:** `nextjs/app/contact-support/page.tsx`

**Features:**

#### ✅ Bilingual Support (Thai/English)
- Automatic language detection from query params
- All text translated using existing translation system

#### ✅ Verification Details Display
- Serial number
- Pin code
- Brand/Organization ID
- Pre-filled from query parameters for easy reference

#### ✅ Multiple Contact Channels
1. **Email:** `support@example.com`
   - With mailto link
   - Instructions to include Serial and Pin

2. **Phone:** `+66 2 XXX XXXX`
   - Business hours displayed
   - Click-to-call on mobile devices

3. **LINE Official Account:** `@example`
   - Opens LINE app/web
   - Popular in Thailand

#### ✅ Important Notice Section
- Reminds users to prepare Serial, Pin, and product photos
- Sets expectations (24-48 hour response time)
- Orange warning-style design for visibility

#### ✅ Navigation
- Back button to return to previous page
- Clean, responsive design matching app style

---

## Design Patterns

### Color Scheme
Matches the error/warning state from verify page:
- **Header gradient:** Red gradient `linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)`
- **Page background:** Subtle gray gradient `from-gray-50 to-gray-100`
- **Cards:** White with shadow for clean separation
- **Notice box:** Orange gradient for warnings

### Icons
- Material Design Icons (inline SVG)
- Email icon (envelope)
- Phone icon (telephone)
- LINE icon (official LINE logo SVG)
- Warning icon (triangle with exclamation)
- Back arrow icon

### Responsive Design
- Mobile-first approach
- Max-width container (2xl = 672px)
- Proper spacing and padding
- Touch-friendly buttons

---

## URL Structure

### Route
```
/contact-support
```

### Query Parameters
- `serial` - Serial number from verification
- `pin` - Pin code from verification
- `brand` - Organization/Brand ID
- `lang` - Language preference (`th` or `en`)

### Example URLs

**Thai:**
```
/contact-support?serial=ABC123&pin=456789&brand=ORG001&lang=th
```

**English:**
```
/contact-support?serial=ABC123&pin=456789&brand=ORG001&lang=en
```

---

## When Is This Button Shown?

The Contact Support button appears in `VerifyView.tsx` when verification is **NOT successful**:

```typescript
{isSuccess ? (
  <button>View Product</button>  // Success state
) : (
  <button>Contact Support</button>  // Error/Warning state
)}
```

**Shown for these statuses:**
- ❌ `INVALID` - Invalid verification
- ❌ `ERROR` - System error
- ❌ `FAILED` - Verification failed
- ❌ `NOTFOUND` - Not found
- ❌ `DECRYPT_FAIL` - Decryption error
- ⚠️ `ALREADY_REGISTERED` - Already registered (warning)
- ⚠️ `EXPIRED` - Expired item
- Any other non-success status

---

## Customization Guide

### Update Contact Information

Edit `nextjs/app/contact-support/page.tsx`:

```typescript
// Email
<a href="mailto:support@yourcompany.com">
  support@yourcompany.com
</a>

// Phone
<a href="tel:+66-2-xxx-xxxx">
  +66 2 XXX XXXX
</a>

// LINE
<a href="https://line.me/ti/p/@yourlineaccount">
  @yourlineaccount
</a>
```

### Add More Contact Channels

Add to the contact channels section:

```tsx
{/* WhatsApp */}
<div className="flex items-start gap-3">
  <div className="mt-1">
    {/* WhatsApp icon SVG */}
  </div>
  <div>
    <h3 className="font-semibold text-gray-800">WhatsApp</h3>
    <a href="https://wa.me/66xxxxxxxxx">
      +66 XX XXX XXXX
    </a>
  </div>
</div>
```

### Change Response Time

Edit the notice section:

```tsx
{lang === "th"
  ? "เวลาตอบกลับโดยเฉลี่ย 24-48 ชั่วโมง"
  : "Average response time is 24-48 hours."}
```

---

## Testing Checklist

- [x] Button appears on error/warning states
- [x] Button navigates with correct query parameters
- [x] Page loads with serial, pin, brand displayed
- [x] Thai language displays correctly
- [x] English language displays correctly
- [x] Email mailto link works
- [x] Phone tel link works (on mobile)
- [x] LINE link opens correctly
- [x] Back button returns to previous page
- [x] Responsive design on mobile devices
- [x] Icons display correctly
- [x] Gradients and styling match design

---

## Testing Instructions

### Manual Testing

1. **Trigger Error State:**
   ```
   http://localhost:3500/test?scenario=error&lang=th
   ```

2. **Click Contact Support Button**

3. **Verify:**
   - URL contains serial, pin, brand, lang parameters
   - Page displays in correct language
   - All contact links work
   - Back button returns to verify page

### Test Different Languages

**Thai:**
```
http://localhost:3500/test?scenario=error&lang=th
```

**English:**
```
http://localhost:3500/test?scenario=error&lang=en
```

### Direct Access

You can also access the page directly:
```
http://localhost:3500/contact-support?serial=TEST123&pin=456789&brand=TESTORG&lang=en
```

---

## Future Enhancements

### Potential Improvements

1. **Contact Form Integration**
   - Add inline contact form
   - Backend API for form submission
   - Email notifications to support team

2. **Live Chat Widget**
   - Integrate Intercom/Zendesk/Tawk.to
   - Real-time support

3. **Ticket System**
   - Auto-create support ticket
   - Ticket tracking number
   - Status updates via email

4. **FAQ Section**
   - Common issues and solutions
   - Search functionality
   - Reduce support load

5. **Screenshot Upload**
   - Allow users to upload product photos
   - Attach to support request
   - Better troubleshooting

6. **Analytics**
   - Track how many users contact support
   - Which error types trigger most contacts
   - Improve verification flow based on data

---

## Related Files

- `nextjs/components/themes/default/VerifyView.tsx` - Contact Support button
- `nextjs/app/contact-support/page.tsx` - Contact Support page
- `nextjs/lib/translations.ts` - Translation strings
- `.github/agent-md/CONTACT_SUPPORT_IMPLEMENTATION.md` - This documentation

---

## Notes

- Original C# version never implemented this functionality
- This is a brand new feature for Next.js version
- Provides better user experience for error cases
- Contact information should be updated before production deployment
- Consider adding actual support team email/phone/LINE account

---

**Implementation Complete:** This feature is now fully functional and ready for production use after updating contact information.