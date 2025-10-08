# Widget Backups

This folder contains backup versions of your widget files created during development.

## Files:

- `widget-old.html` - Previous HTML before clean version
- `widget-old.js` - Previous JavaScript before clean version
- `fields-old.json` - Previous field configuration
- `widget-backup-20251008-094640.css` - Previous CSS before clean version

## To Restore a Backup:

```powershell
# Restore HTML
Copy-Item "widget\backups\widget-old.html" "widget\widget.html" -Force

# Restore JavaScript
Copy-Item "widget\backups\widget-old.js" "widget\widget.js" -Force

# Restore CSS
Copy-Item "widget\backups\widget-backup-20251008-094640.css" "widget\widget.css" -Force

# Restore Fields
Copy-Item "widget\backups\fields-old.json" "widget\fields.json" -Force
```

## Note:
These backups were created on **October 8, 2025** when switching to the clean working version with weapon perks support.
