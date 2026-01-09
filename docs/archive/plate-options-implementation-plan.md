# Plate Options Implementation Plan

> **⚠️ ARCHIVED:** This planning document is outdated. The implementation is complete - see `AUSTRALIAN_PLATE_OPTIONS.md` in the main repo which confirms all 48+ colors and 16 plate types are now implemented.
>
> **Archived:** 9 January 2026

**Created:** 2026-01-07
**Status:** ~~Planning~~ Complete (Archived)
**Scope:** VIC plates first, then expand to other states

---

## Current State Summary

### What We Have Now

**Database/API (supabase schema):**
```sql
-- plate_color_scheme enum (13 values)
'black_on_white', 'white_on_black', 'blue_on_white', 'black_on_yellow',
'green_on_white', 'maroon_on_white', 'silver_on_black', 'gold_on_black',
'white_on_blue', 'white_on_maroon', 'blue_on_white_jdm', 'green_on_white_jdm', 'custom'

-- plate_size_format enum (7 values)
'standard', 'slimline', 'euro', 'square', 'us_style', 'jdm', 'motorcycle'

-- plate_type in listings (7 values)
'custom', 'heritage', 'euro', 'standard', 'slimline', 'numeric', 'prestige'
```

**iOS App Types:**
- PlateColorScheme enum (13 values)
- PlateSizeFormat enum (7 values)
- PlateType enum (7 values)

**Website Types:**
- Same as above in TypeScript

---

## Phase 1: Database Schema Updates

### 1.1 New Enums to Add

```sql
-- Plate material type
CREATE TYPE plate_material AS ENUM (
  'aluminium',
  'acrylic',
  'polycarbonate',
  'enamel'
);

-- Plate style category (broader than plate_type)
CREATE TYPE plate_style_category AS ENUM (
  'custom',
  'premium',
  'heritage',
  'sports',
  'car_brands',
  'international',
  'lifestyle',
  'motorcycle',
  'business',
  'sequential'
);
```

### 1.2 Expanded plate_color_scheme Enum

```sql
-- Drop and recreate with all VIC colors
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'yellow_on_black';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'red_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'pink_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'purple_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'orange_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'grey_on_black';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'teal_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'ocean_blue_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'sky_blue_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'navy_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'lime_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'forest_green_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'burgundy_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'fire_red_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'charcoal_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'brown_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'tan_on_black';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'cream_on_black';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'off_white_on_black';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'matte_black_on_white';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'matte_white_on_black';
-- Team colors
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_carlton';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_collingwood';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_richmond';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_essendon';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_melbourne';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_geelong';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_hawthorn';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_north_melbourne';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_western_bulldogs';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'afl_st_kilda';
-- Premium finishes
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'liquid_metal_silver';
ALTER TYPE plate_color_scheme ADD VALUE IF NOT EXISTS 'liquid_metal_chrome';
```

### 1.3 Expanded plate_type Enum

```sql
ALTER TYPE plate_type ADD VALUE IF NOT EXISTS 'deluxe';
ALTER TYPE plate_type ADD VALUE IF NOT EXISTS 'liquid_metal';
ALTER TYPE plate_type ADD VALUE IF NOT EXISTS 'frameless';
ALTER TYPE plate_type ADD VALUE IF NOT EXISTS 'signature';
ALTER TYPE plate_type ADD VALUE IF NOT EXISTS 'afl_team';
ALTER TYPE plate_type ADD VALUE IF NOT EXISTS 'fishing';
ALTER TYPE plate_type ADD VALUE IF NOT EXISTS 'business';
ALTER TYPE plate_type ADD VALUE IF NOT EXISTS 'sequential';
ALTER TYPE plate_type ADD VALUE IF NOT EXISTS 'car_brand';
```

### 1.4 New Columns on Listings Table

```sql
ALTER TABLE listings ADD COLUMN IF NOT EXISTS material plate_material DEFAULT 'aluminium';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS style_category plate_style_category;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS team_name TEXT; -- For AFL/NRL plates
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_discontinued BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS character_count INTEGER;
```

---

## Phase 2: API Updates

### 2.1 Update Types (api/src/types/database.ts)

```typescript
// Add new color schemes
export type PlateColorScheme =
  | 'black_on_white'
  | 'white_on_black'
  | 'blue_on_white'
  | 'black_on_yellow'
  | 'yellow_on_black'
  | 'green_on_white'
  | 'maroon_on_white'
  | 'silver_on_black'
  | 'gold_on_black'
  | 'white_on_blue'
  | 'white_on_maroon'
  | 'red_on_white'
  | 'pink_on_white'
  | 'purple_on_white'
  | 'orange_on_white'
  | 'grey_on_black'
  | 'teal_on_white'
  | 'ocean_blue_on_white'
  | 'sky_blue_on_white'
  | 'navy_on_white'
  | 'lime_on_white'
  | 'forest_green_on_white'
  | 'burgundy_on_white'
  | 'fire_red_on_white'
  | 'charcoal_on_white'
  | 'brown_on_white'
  | 'tan_on_black'
  | 'cream_on_black'
  | 'off_white_on_black'
  | 'matte_black_on_white'
  | 'matte_white_on_black'
  | 'blue_on_white_jdm'
  | 'green_on_white_jdm'
  | 'afl_carlton'
  | 'afl_collingwood'
  | 'afl_richmond'
  | 'afl_essendon'
  | 'afl_melbourne'
  | 'afl_geelong'
  | 'afl_hawthorn'
  | 'afl_north_melbourne'
  | 'afl_western_bulldogs'
  | 'afl_st_kilda'
  | 'liquid_metal_silver'
  | 'liquid_metal_chrome'
  | 'custom';

export type PlateType =
  | 'custom'
  | 'heritage'
  | 'euro'
  | 'standard'
  | 'slimline'
  | 'numeric'
  | 'prestige'
  | 'deluxe'
  | 'liquid_metal'
  | 'frameless'
  | 'signature'
  | 'afl_team'
  | 'fishing'
  | 'business'
  | 'sequential'
  | 'car_brand';

export type PlateMaterial = 'aluminium' | 'acrylic' | 'polycarbonate' | 'enamel';
```

### 2.2 Update Validation (api/src/routes/listings.ts)

Add new values to validation arrays.

---

## Phase 3: iOS App Updates

### 3.1 Update Models (AusPlates/Models/PlateEnums.swift)

```swift
enum PlateColorScheme: String, Codable, CaseIterable {
    // Existing
    case blackOnWhite = "black_on_white"
    case whiteOnBlack = "white_on_black"
    case blueOnWhite = "blue_on_white"
    case blackOnYellow = "black_on_yellow"
    case greenOnWhite = "green_on_white"
    case maroonOnWhite = "maroon_on_white"
    case silverOnBlack = "silver_on_black"
    case goldOnBlack = "gold_on_black"
    case whiteOnBlue = "white_on_blue"
    case whiteOnMaroon = "white_on_maroon"
    case blueOnWhiteJdm = "blue_on_white_jdm"
    case greenOnWhiteJdm = "green_on_white_jdm"

    // New VIC colors
    case yellowOnBlack = "yellow_on_black"
    case redOnWhite = "red_on_white"
    case pinkOnWhite = "pink_on_white"
    case purpleOnWhite = "purple_on_white"
    case orangeOnWhite = "orange_on_white"
    case greyOnBlack = "grey_on_black"
    case tealOnWhite = "teal_on_white"
    case oceanBlueOnWhite = "ocean_blue_on_white"
    case skyBlueOnWhite = "sky_blue_on_white"
    case navyOnWhite = "navy_on_white"
    case limeOnWhite = "lime_on_white"
    case forestGreenOnWhite = "forest_green_on_white"
    case burgundyOnWhite = "burgundy_on_white"
    case fireRedOnWhite = "fire_red_on_white"
    case charcoalOnWhite = "charcoal_on_white"
    case brownOnWhite = "brown_on_white"
    case tanOnBlack = "tan_on_black"
    case creamOnBlack = "cream_on_black"
    case offWhiteOnBlack = "off_white_on_black"
    case matteBlackOnWhite = "matte_black_on_white"
    case matteWhiteOnBlack = "matte_white_on_black"

    // Team colors
    case aflCarlton = "afl_carlton"
    case aflCollingwood = "afl_collingwood"
    case aflRichmond = "afl_richmond"
    case aflEssendon = "afl_essendon"
    case aflMelbourne = "afl_melbourne"
    case aflGeelong = "afl_geelong"
    case aflHawthorn = "afl_hawthorn"
    case aflNorthMelbourne = "afl_north_melbourne"
    case aflWesternBulldogs = "afl_western_bulldogs"
    case aflStKilda = "afl_st_kilda"

    // Premium
    case liquidMetalSilver = "liquid_metal_silver"
    case liquidMetalChrome = "liquid_metal_chrome"

    case custom = "custom"

    var textColor: String { ... }
    var backgroundColor: String { ... }
    var displayName: String { ... }
}
```

### 3.2 Update Create Listing Flow

- Add color scheme picker with visual swatches
- Add plate type picker with descriptions
- Add material picker (for filtering/display)
- Update PlateView to render all new colors

### 3.3 Update Search/Filter

- Add color scheme filter
- Add plate type filter
- Add material filter (optional)

---

## Phase 4: Website Updates

### 4.1 Update Types (src/types/listing.ts)

Mirror the iOS/API type changes in TypeScript.

### 4.2 Update Color Mapping

```typescript
export const COLOR_SCHEME_COLORS: Record<PlateColorScheme, { text: string; background: string }> = {
  // Existing...

  // New VIC colors
  yellow_on_black: { text: '#FFD700', background: '#000000' },
  red_on_white: { text: '#CC0000', background: '#FFFFFF' },
  pink_on_white: { text: '#FF69B4', background: '#FFFFFF' },
  purple_on_white: { text: '#800080', background: '#FFFFFF' },
  orange_on_white: { text: '#FF6600', background: '#FFFFFF' },
  grey_on_black: { text: '#808080', background: '#000000' },
  teal_on_white: { text: '#008080', background: '#FFFFFF' },
  ocean_blue_on_white: { text: '#006994', background: '#FFFFFF' },
  sky_blue_on_white: { text: '#87CEEB', background: '#FFFFFF' },
  navy_on_white: { text: '#000080', background: '#FFFFFF' },
  lime_on_white: { text: '#32CD32', background: '#FFFFFF' },
  forest_green_on_white: { text: '#228B22', background: '#FFFFFF' },
  burgundy_on_white: { text: '#800020', background: '#FFFFFF' },
  fire_red_on_white: { text: '#FF0000', background: '#FFFFFF' },
  charcoal_on_white: { text: '#36454F', background: '#FFFFFF' },
  brown_on_white: { text: '#8B4513', background: '#FFFFFF' },
  tan_on_black: { text: '#D2B48C', background: '#000000' },
  cream_on_black: { text: '#FFFDD0', background: '#000000' },
  off_white_on_black: { text: '#FAF9F6', background: '#000000' },
  matte_black_on_white: { text: '#28282B', background: '#FFFFFF' },
  matte_white_on_black: { text: '#F5F5F5', background: '#000000' },

  // Team colors
  afl_carlton: { text: '#FFFFFF', background: '#001C3D' },
  afl_collingwood: { text: '#FFFFFF', background: '#000000' },
  afl_richmond: { text: '#000000', background: '#FFD700' },
  afl_essendon: { text: '#000000', background: '#CC0000' },
  afl_melbourne: { text: '#FFFFFF', background: '#000080' },
  afl_geelong: { text: '#FFFFFF', background: '#001C3D' },
  afl_hawthorn: { text: '#FFD700', background: '#4D2004' },
  afl_north_melbourne: { text: '#FFFFFF', background: '#003B73' },
  afl_western_bulldogs: { text: '#FFFFFF', background: '#003B73' },
  afl_st_kilda: { text: '#FFFFFF', background: '#CC0000' },

  // Premium
  liquid_metal_silver: { text: '#C0C0C0', background: '#1A1A1A' },
  liquid_metal_chrome: { text: '#4A4A4A', background: '#1A1A1A' },
};
```

### 4.3 Update Search Page

- Add color filter dropdown
- Add plate type filter
- Visual color swatches in filter UI

---

## Implementation Order

### Step 1: Database Migration
- [ ] Create migration SQL file
- [ ] Run migration in Supabase
- [ ] Verify enum values added

### Step 2: API Updates
- [ ] Update database.ts types
- [ ] Update listings.ts validation
- [ ] Update create/update endpoints
- [ ] Build and deploy API

### Step 3: iOS App Updates
- [ ] Create PlateEnums.swift with all values
- [ ] Update PlateColorScheme with hex colors
- [ ] Update PlateView rendering
- [ ] Update CreateListingFlow with pickers
- [ ] Update search filters
- [ ] Build and test

### Step 4: Website Updates
- [ ] Update listing.ts types
- [ ] Update COLOR_SCHEME_COLORS mapping
- [ ] Update PlateView component
- [ ] Update ListingCard component
- [ ] Update search/filter UI
- [ ] Build and test

### Step 5: Testing
- [ ] Create test listing with new color (VIC)
- [ ] Verify renders correctly on iOS
- [ ] Verify renders correctly on website
- [ ] Test search/filter by new colors

---

## Files to Modify

### Database
- `supabase/migrations/20260107_vic_plate_options.sql` (new)

### API
- `api/src/types/database.ts`
- `api/src/routes/listings.ts`

### iOS App
- `AusPlates/Models/PlateEnums.swift` (new or update existing)
- `AusPlates/Models/Listing.swift`
- `AusPlates/Components/PlateView.swift`
- `AusPlates/Views/CreateListing/CreateListingFlow.swift`
- `AusPlates/Views/Search/SearchFiltersView.swift`

### Website
- `src/types/listing.ts`
- `src/components/PlateView.tsx`
- `src/components/ListingCard.tsx`
- `src/app/plates/page.tsx` (filters)
- `src/lib/api.ts`

---

## Rollback Plan

If issues occur:
1. Enum values can be added but not removed in PostgreSQL
2. Keep old values as valid (backward compatible)
3. Website/App can handle unknown values with fallback to 'custom'
