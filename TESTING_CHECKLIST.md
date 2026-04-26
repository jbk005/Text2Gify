# Text-to-GIF Testing Checklist

## Pre-Testing Setup
- [ ] Start development server: `npm run dev`
- [ ] Open browser to `http://localhost:5173`

---

## 1. Input Screen
- [ ] Text input field displays correctly (single line input)
- [ ] Character count shows below input field
- [ ] Character count updates as user types
- [ ] Placeholder text "Enter your text here..." displays
- [ ] Continue button is disabled when input is empty
- [ ] Continue button becomes enabled when text is entered
- [ ] Clicking Continue navigates to Style screen

---

## 2. Style Screen - Preview Canvas
- [ ] Canvas displays with proper dimensions (fits text width)
- [ ] Text renders correctly in the canvas
- [ ] Play/Pause button toggles animation
- [ ] Preview animation shows first frame hold then character reveal
- [ ] Changing font updates the preview immediately
- [ ] Changing font style updates the preview without breaking
- [ ] Changing font size updates the preview
- [ ] Canvas width adjusts when font size changes

---

## 3. Style Screen - Background Options
- [ ] Transparent Background checkbox toggles correctly
- [ ] When unchecked, Background color picker is enabled
- [ ] When checked, Background color picker is disabled
- [ ] Text color picker works and updates preview
- [ ] Background color picker works and updates preview
- [ ] Checkerboard pattern shows when transparency is enabled

---

## 4. Style Screen - Font Selection
- [ ] Font dropdown opens and shows available fonts
- [ ] Font list is scrollable if many fonts available
- [ ] Selecting a font updates the preview
- [ ] Font styles display correctly (not exceeding viewport)
- [ ] Font styles wrap to multiple lines if needed
- [ ] Different font styles can be selected
- [ ] Selected font style is highlighted

---

## 5. Style Screen - Animation Settings
- [ ] Animation Settings accordion opens/closes
- [ ] First Frame Hold slider adjusts from 0.5s to 5s
- [ ] First Frame Hold value displays correctly
- [ ] Reveal Duration slider adjusts from 60ms to 3000ms
- [ ] Reveal Duration shows "Slow" and "Fast" labels
- [ ] "Reset to Default" button resets both values
- [ ] Animation preview reflects changes in timing

---

## 6. GIF Generation
- [ ] Generate GIF button is clickable
- [ ] Clicking Generate shows progress percentage
- [ ] Progress bar fills as generation progresses
- [ ] After generation, screen navigates to Result
- [ ] Generated GIF displays in result preview
- [ ] GIF animation plays correctly (loops)

---

## 7. Result Screen - Download
- [ ] Filename is editable in the input field
- [ ] Default filename includes timestamp
- [ ] Changing filename updates the displayed value
- [ ] Dimensions display correctly (width × height px)
- [ ] File size displays in KB or MB
- [ ] Format shows "GIF"
- [ ] Download GIF button triggers download
- [ ] Downloaded file has the specified filename
- [ ] "Create New" button navigates to Input screen

---

## 8. GIF Quality Checks
### Solid Background
- [ ] GIF has solid background color (not transparent)
- [ ] Background color matches selected color
- [ ] Text is clearly visible against background
- [ ] No artifacts or rendering issues

### Transparent Background
- [ ] GIF background is transparent
- [ ] Transparent areas show checkerboard/background in viewers
- [ ] Text edges are clean

### Animation
- [ ] First frame shows full text for specified duration
- [ ] Character reveal animation is smooth
- [ ] Animation loops correctly
- [ ] No frame skipping or stuttering

---

## 9. Navigation & State
- [ ] Back button returns to Input screen
- [ ] Back button clears current style settings
- [ ] "Create New" resets all state
- [ ] Browser back button works correctly
- [ ] No memory leaks after multiple generations

---

## 10. Responsive Design
- [ ] UI fits on mobile screens (< 720px)
- [ ] Font styles wrap properly on small screens
- [ ] Buttons are touch-friendly (adequate size)
- [ ] Canvas resizes appropriately

---

## 11. Error Handling
- [ ] Empty text input shows error message
- [ ] Generation errors display banner
- [ ] "Try Again" button works after error

---

## 12. Performance
- [ ] Font loading completes without hanging
- [ ] GIF generation completes within reasonable time
- [ ] No UI freezing during generation
- [ ] Multiple generations don't cause memory issues

---

## Bug Reports
If you find any bugs, document them here:

| Bug Description | Location | Expected | Actual |
|----------------|----------|----------|--------|
| | | | |
| | | | |
| | | | |
