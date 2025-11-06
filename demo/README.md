# D2 Loadout Widget - Professional Demo

This is a standalone demonstration of the D2 Loadout Widget showcasing all features with live data from Bungie's API.

## Features

- **Live Data**: Uses real Destiny 2 data from Bungie ID: Marty#2689
- **Interactive Controls**: Left panel with view modes and display options
- **Professional Layout**: Clean white background with centered widget display
- **Multiple View Modes**:
  - Full Loadout (all sections)
  - Weapons Only
  - Armor Only
  - Stats Only
  - Subclass Only
  - Artifact Only

## How to Use

1. **Open the Demo**:
   - Simply open `index.html` in any modern web browser
   - Or use a local server for best results

2. **View Controls**:
   - Click buttons in the left panel to switch between different views
   - The active view is highlighted in gold

3. **Display Options**:
   - Use checkboxes to toggle individual sections
   - "Show Weapon Perks" displays weapon perk icons

4. **Refresh Data**:
   - Click "Refresh Data" button to manually update loadout
   - Data auto-refreshes every 60 seconds

## File Structure

```
demo/
├── index.html              # Main demo page
├── assets/
│   ├── css/
│   │   └── widget.css      # Widget styles
│   └── js/
│       ├── demo.js         # Demo controls and API integration
│       └── widget.js       # Widget core functionality
└── README.md               # This file
```

## Technical Details

- **API Endpoint**: https://d2-loadout-widget-backend.onrender.com
- **Bungie ID**: Marty#2689
- **Auto-Refresh**: 60 seconds
- **Fonts**: Roboto Condensed (Google Fonts)

## Customization

The demo uses inline CSS for the control panel. To customize:

1. **Colors**: Edit the gradient in `.control-panel` background
2. **Layout**: Adjust `.widget-display` padding and alignment
3. **Panel Width**: Modify `.control-panel` width (default: 320px)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

## Troubleshooting

### Widget Not Loading
- Check browser console (F12) for errors
- Verify internet connection (needs access to Bungie API)
- Try clicking "Refresh Data" button

### Data Not Updating
- Bungie API may be experiencing delays (2-5 minutes normal)
- Check if the character is currently playing Destiny 2
- Verify API endpoint is accessible

### Styling Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Ensure widget.css is loading properly
- Check browser DevTools for CSS errors

## Support

For issues or questions:
- Email: contact@noticemesenpai.studio
- Include: Screenshots, browser console logs, description of issue

## License

© 2025 Studio Notice Me Senpai - All Rights Reserved

This demo is for presentation purposes only.
