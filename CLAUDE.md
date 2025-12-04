# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fandom Spoiler Guard - A browser extension that protects users from spoilers on Fandom wiki pages.

## Target URLs

The extension activates on: `*.fandom.com/wiki/*`

## Features

### Spoiler Protection
- **Character Death/Alive Status**: Hides information about whether characters are dead or alive

## Target DOM Structure

### Portable Infobox
- Target class: `portable-infobox`
- Contains character information in label-value pairs
- Structure: Each row has a label (e.g., "Died", "Status") and a corresponding value

### Spoiler Keywords (Default List)
Keywords that indicate death/alive status (varies by fandom):
- `Died`
- `Status`

Users can add custom keywords to this list.

## UI Behavior

### Blur Mechanism
- Matching content is blurred by default
- User clicks on blurred area to reveal the spoiler content

### Context Menu (Right-Click)
- When right-clicking inside the infobox, show a "Hide this" option
- Allows users to manually blur any infobox field they want

### Popup Window
- Small popup accessible from the extension icon
- Allows users to view, add, edit, and remove keywords from the spoiler list

## Technical Architecture

### Manifest V3 Chrome Extension

**Files:**
- `manifest.json` - Extension configuration
- `content.js` - Injected into fandom pages, handles blur logic
- `styles.css` - Blur effect styling
- `background.js` - Service worker for context menu
- `popup.html/js` - Keyword management UI

### Storage
- Uses `chrome.storage.sync` for keywords and hidden fields
- Syncs across user's devices

### DOM Selectors
- Infobox: `.portable-infobox`
- Data rows: `.pi-item.pi-data`
- Labels: `.pi-data-label`
- Values: `.pi-data-value`

## Development

### Load Extension in Chrome
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project folder

### Testing
Test on pages like:
- https://robin-hood.fandom.com/wiki/Eleanor_of_Aquitaine
- https://mistborn.fandom.com/wiki/Kelsier
