# Widget Sizing Fix

## Issue
The widget was appearing too small and weapons were wrapping to two lines because the layout was being compressed incorrectly.

## Root Cause
The widget's **natural design size** is **760px × 500px** with a 3-column grid layout:
- Column 1: Weapons (280px)
- Column 2: Armor (320px)  
- Column 3: Stats (160px)
- **Total: 760px**

The demo was trying to scale/resize the widget to fill an 854x547px container, which broke the grid layout and caused content wrapping.

## Solution
**Use the widget at its natural 760×500 size**, centered within the StreamElements browser source viewport (854×547px).

### Changes Made to `demo/index.html`:

1. **Created a viewport container** matching StreamElements browser source dimensions:
   ```css
   .widget-viewport {
     width: 854px;
     height: 547px;
     background: #000000;
     display: flex;
     align-items: center;
     justify-content: center;
   }
   ```

2. **Widget maintains natural size**:
   ```css
   #d2-loadout-widget {
     width: 760px !important;
     max-width: 760px !important;
     height: 500px !important;
   }
   ```

3. **Black background** matching StreamElements overlay style

## Result
✅ Widget displays at correct 760×500 size  
✅ Weapons show on single line (not wrapping)  
✅ Grid layout maintains proper proportions  
✅ Centered in 854×547 viewport (matches StreamElements)  
✅ Black background matches stream overlay appearance  

## StreamElements Setup
When adding to StreamElements:
- Browser Source dimensions: **854 × 547**
- Widget will auto-center at **760 × 500** 
- Use the widget files directly from `/widget/` folder
- No scaling needed - widget is already optimized

## Demo URL
- GitHub Pages: https://martinricard.github.io/d2loadout-widget/demo/
- Widget shown exactly as it appears in StreamElements overlay
