

## Center and Enlarge the stackd Verified Badge

### What Changes

The `StackdVerifiedBadge` component will be updated so the content is centered and the seal image matches the host avatar size (64px instead of 48px).

### File to Modify

**`src/components/StackdVerifiedBadge.tsx`**:

1. Add `text-center items-center` to the container div so all content (image, heading, description, link) is centered
2. Center the seal image using `mx-auto`
3. Change the seal size from `h-12 w-12` (48px) to `h-16 w-16` (64px) to match the host avatar in "Meet your host"

### What Stays the Same

- The text content (heading, description, "Learn more" link) remains identical
- The placement on both `PublicProfile.tsx` and `ProfilePreview.tsx` stays the same
- No other files need changes

