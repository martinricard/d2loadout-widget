# Contributing to D2 Loadout Widget

Thank you for your interest in contributing to the D2 Loadout Widget! This document provides guidelines and information for contributors.

## 🤝 Types of Contributions

We welcome several types of contributions:

### 🐛 Bug Reports
Found a bug? Help us fix it!

**Before submitting:**
- Check existing [GitHub Issues](https://github.com/martinricard/d2loadout-widget/issues) to avoid duplicates
- Test with the latest version
- Verify it's not a configuration issue (check [User Guide](docs/USER_GUIDE.md))

**When submitting:**
Include:
1. **Your Bungie ID** (for testing)
2. **Steps to reproduce** (be specific)
3. **Expected behavior** (what should happen)
4. **Actual behavior** (what actually happens)
5. **Console errors** (F12 → Console tab)
6. **Screenshots** (if visual issue)
7. **Environment** (OBS/Streamlabs, browser version)

### ✨ Feature Requests
Have an idea? We'd love to hear it!

**Before submitting:**
- Check if it's already requested
- Consider if it fits the widget's purpose (loadout display for streams)
- Think about how it benefits most streamers

**When submitting:**
Include:
1. **Problem statement** - What issue does this solve?
2. **Proposed solution** - How would it work?
3. **Use case** - When would you use this?
4. **Benefits** - How does it help streamers?
5. **Mockups** (optional) - Visual examples

### 📖 Documentation Improvements
Spotted a typo? Instructions unclear? Documentation PRs welcome!

### 💻 Code Contributions
Want to contribute code? Awesome!

**Currently:**
This is a personal project, so direct code contributions are not actively solicited. However:
- Bug fixes are very welcome
- Performance improvements appreciated
- New features should be discussed in an Issue first

## 🚀 Development Setup

### Prerequisites
- Node.js 18+ installed
- Git installed
- Bungie.net API key ([Get one here](https://www.bungie.net/en/Application))
- TinyURL API token ([Register here](https://tinyurl.com/app/dev))

### Setup Steps

1. **Fork the repository**
   ```bash
   # On GitHub, click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/d2loadout-widget.git
   cd d2loadout-widget
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/martinricard/d2loadout-widget.git
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Test the widget**
   - Open `test-widget.html` in a browser
   - Or add to StreamElements for full testing

### Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

3. **Test your changes**
   - Test with multiple Bungie IDs
   - Test all 3 character classes
   - Check browser console for errors
   - Verify no API rate limit issues

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: fix bug description"
   ```

   **Commit message format:**
   - `feat: description` - New feature
   - `fix: description` - Bug fix
   - `docs: description` - Documentation only
   - `style: description` - Formatting, no code change
   - `refactor: description` - Code restructuring
   - `perf: description` - Performance improvement
   - `test: description` - Adding tests
   - `chore: description` - Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Fill in the PR template
   - Wait for review

## 📝 Code Style Guidelines

### JavaScript
- Use **vanilla JavaScript** (no frameworks for widget)
- Use `const` and `let` (no `var`)
- Use template literals for strings with variables
- Add JSDoc comments for functions
- Handle errors gracefully with try-catch
- Use descriptive variable names

**Example:**
```javascript
/**
 * Fetches loadout data from Bungie API
 * @param {string} bungieId - The Bungie name with tag (e.g., "Name#1234")
 * @returns {Promise<Object>} Loadout data
 */
async function fetchLoadout(bungieId) {
  try {
    const response = await fetch(`/api/loadout/${bungieId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[fetchLoadout] Error:', error);
    throw error;
  }
}
```

### CSS
- Use CSS variables for colors and common values
- Follow existing class naming conventions
- Group related styles together
- Add comments for complex layouts
- Mobile-first approach (if applicable)

**Example:**
```css
/* ========== WEAPON SECTION ========== */
.weapon-slot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--bg-color);
  border-radius: var(--radius);
  transition: all 0.15s ease;
}

.weapon-slot:hover {
  background: #25252a;
}
```

### HTML
- Use semantic HTML elements
- Add appropriate ARIA labels
- Keep structure clean and readable
- Use data attributes for configuration

### Backend
- Validate all inputs
- Use environment variables for secrets
- Add proper error handling
- Log important operations
- Cache when possible

## 🧪 Testing

### Manual Testing Checklist
Before submitting a PR, test:

- [ ] Widget loads without errors
- [ ] Data displays correctly
- [ ] All chat commands work
- [ ] Channel point redemptions work
- [ ] Auto-hide functions properly
- [ ] Enhanced perks show correctly
- [ ] Exotic items highlighted
- [ ] Stats accurate
- [ ] DIM links generate correctly
- [ ] No console errors
- [ ] Works with multiple Bungie IDs
- [ ] Works with all 3 classes

### Testing Different Scenarios
- Different character classes (Warlock, Titan, Hunter)
- Different subclasses (Arc, Solar, Void, Stasis, Strand, Prismatic)
- Different loadout configurations
- Edge cases (no exotic, no enhanced perks, etc.)
- Error scenarios (invalid Bungie ID, private profile, etc.)

## 📚 Documentation

When adding features or making significant changes:

1. **Update README.md** - Add to feature list if applicable
2. **Update USER_GUIDE.md** - Document user-facing changes
3. **Update CHANGELOG.md** - Add entry under [Unreleased]
4. **Add inline comments** - Explain complex logic
5. **Update JSDoc** - Keep function documentation current

## 🐛 Bug Fix Guidelines

### Before Fixing
1. Reproduce the bug consistently
2. Identify root cause (not just symptoms)
3. Check if it's already being worked on
4. Consider impact on existing features

### While Fixing
1. Fix the root cause, not symptoms
2. Add comments explaining the fix
3. Test the fix thoroughly
4. Test that you didn't break anything else
5. Consider adding prevention (validation, error handling)

### After Fixing
1. Update documentation if needed
2. Add entry to CHANGELOG.md
3. Close the related issue in your PR description

## 🚀 Feature Development Guidelines

### Before Starting
1. **Discuss in an Issue first** - Get feedback on approach
2. **Check existing code** - See if similar patterns exist
3. **Plan the implementation** - Think through edge cases
4. **Consider impact** - Will this affect existing features?

### Design Considerations
- **Performance** - Will this slow down the widget?
- **API Limits** - Will this hit Bungie API rate limits?
- **Configurability** - Should users be able to toggle this?
- **Backward Compatibility** - Will this break existing setups?

### Implementation
1. Start with smallest viable version
2. Add error handling from the start
3. Make it configurable if reasonable
4. Test with various scenarios
5. Document as you go

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] All tests pass (manual testing)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No console errors
- [ ] Tested with multiple scenarios

### PR Description Should Include
1. **What** - What does this PR do?
2. **Why** - Why is this change needed?
3. **How** - How does it work?
4. **Testing** - What testing was done?
5. **Screenshots** - If visual change

### After Submitting
- Respond to review feedback promptly
- Make requested changes in new commits
- Ask questions if feedback unclear
- Be patient - reviews take time

## 📋 Project Structure

```
d2loadout-widget/
├── backend/
│   ├── server.js          # Main API server (1285 lines)
│   ├── package.json       # Dependencies
│   └── .env.example       # Environment template
├── widget/
│   ├── widget.html        # Widget markup
│   ├── widget.css         # Styling (1020 lines)
│   ├── widget.js          # Logic (1112 lines)
│   ├── fields.json        # Configuration
│   └── instructions.html  # Setup guide
├── docs/
│   └── [40+ documentation files]
└── test-widget.html       # Local testing
```

## 🎯 Priorities

Current development priorities:

1. **Stability** - Bug fixes take precedence
2. **Performance** - Speed and efficiency matter
3. **Documentation** - Keep docs up-to-date
4. **Features** - New features after above are solid

## ❓ Questions?

- 💬 **General Questions**: Open a Discussion on GitHub
- 🐛 **Bug Reports**: Open an Issue
- ✨ **Feature Requests**: Open an Issue
- 💻 **Code Questions**: Comment on relevant PR/Issue

## 📜 Code of Conduct

### Be Respectful
- Be kind and courteous
- Respect different viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Collaborative
- Help others when you can
- Share knowledge and experience
- Give credit where due
- Assume good intentions

### Be Professional
- Use welcoming and inclusive language
- Stay on topic
- No harassment or trolling
- Keep it about the code, not the person

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to D2 Loadout Widget!** 🎮

Every bug report, feature request, and code contribution helps make this widget better for the Destiny 2 streaming community.

*Happy coding, Guardian!*
