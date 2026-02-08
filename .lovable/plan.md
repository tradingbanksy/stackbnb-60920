

## Add stackd Verified Quality Badge to Vendor Profiles

### What It Does

Adds a trust/quality badge section near the bottom of every vendor profile page, similar to how Airbnb displays its AirCover badge. The section will feature the uploaded gold wax seal logo alongside text confirming the vendor's category has been vetted for quality by stackd.

### Design

The badge section will appear as its own separated section (consistent with the Airbnb flat-section style used throughout the profile):

```text
-------------------------------------------
|                                         |
|  [Gold Seal Logo]                       |
|                                         |
|  stackd verified                        |
|  Every [category] on stackd is vetted   |
|  for quality and safety so you can      |
|  book with confidence.                  |
|                                         |
|  Learn more                             |
|                                         |
-------------------------------------------
```

- The gold wax seal image (uploaded by user) will be displayed at ~48px size
- "stackd verified" as a bold heading
- A short description dynamically inserting the vendor's category (e.g., "Every Water Sports vendor on stackd...")
- A "Learn more" underlined link (can point to a help/trust page later)
- Separated by horizontal dividers above and below, matching the existing Airbnb-style layout

### Placement

The badge will sit between the **Guest Reviews** section and the **External Links** section on both pages, giving it prominence near the bottom before the CTA bar.

### Files to Change

1. **Copy the uploaded image** to `src/assets/stackd-verified-seal.png` so it can be imported as an ES module

2. **Create `src/components/StackdVerifiedBadge.tsx`** -- A small reusable component that:
   - Imports the gold seal image
   - Accepts a `category` prop (string)
   - Renders the seal image, heading, dynamic description text, and "Learn more" link
   - Uses the same typography scale as the rest of the profile (text-[22px] heading, text-[15px] body)

3. **`src/pages/vendor/PublicProfile.tsx`** -- Add the badge section after Guest Reviews / Airbnb Reviews and before External Links, wrapped in Separator dividers

4. **`src/pages/vendor/ProfilePreview.tsx`** -- Same placement: after Meet your host / before External Links, with Separator dividers

### What Stays the Same

- All existing profile sections remain untouched
- The badge is purely additive -- no existing content is removed or rearranged
- Both profile pages will show the same badge since both have access to `profile.category`

