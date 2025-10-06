# Real Rendering Bugs Found 🐛

## Summary

Found **3 actual rendering bugs** that affect the converted markdown output:

1. ❌ List rendering creates invalid markdown lines
2. ❌ Empty href attributes create broken markdown links
3. ❌ mailto: links are being stripped/converted incorrectly

---

## Bug #1: Invalid Markdown Lines in List Content ⚠️ MEDIUM

**Test:** `list formatting does not break with inconsistent indentation`

**Issue:** After converting lists, some lines start with invalid characters that break markdown rendering.

**Invalid Output:**
```
Received: ["S", "`", "<", "`"]
```

Lines in the markdown are starting with:
- `S` - Not a valid markdown line start
- `` ` `` - Backtick at start of line (should be code fence or inline)
- `<` - HTML tag at start of line (might be valid but suspicious)

**Impact:**
- List items may not render correctly
- Content appears broken or misformatted
- Markdown parsers may skip or misinterpret lines

**How to Reproduce:**
```bash
# Convert broken-lists.php.html
# Check output for lines starting with invalid characters
```

**Expected:**
Lines should start with:
- `-` or `*` for unordered lists
- `1.` for ordered lists
- `#` for headings
- `[` for links
- Regular text
- Whitespace for indentation

---

## Bug #2: Empty href Creates Broken Link Syntax ⚠️ LOW

**Test:** `handles links with no href`

**Issue:** Links with empty `href=""` attribute create broken markdown syntax `[text]()`

**Broken Output:**
```markdown
[Empty href]()
```

**Impact:**
- Renders as clickable link that goes nowhere
- Breaks user experience
- May cause 404s or page reloads

**Example HTML:**
```html
<a href="">Empty href</a>
```

**Current Output:**
```markdown
[Empty href]()
```

**Expected Output:**
Either:
- Remove the link entirely: `Empty href`
- Or skip conversion: `<!-- Link with empty href removed -->`
- Or make it a span: Just render as plain text

**Why This Matters:**
In Jekyll/markdown renderers, `[text]()` becomes `<a href="">text</a>` which:
- Reloads the current page when clicked
- Adds unnecessary link styling
- Confuses users

---

## Bug #3: mailto: Links Stripped ⚠️ MEDIUM

**Test:** `preserves mailto and tel links`

**Issue:** `mailto:` links are being converted to bare email addresses instead of clickable links.

**HTML Input:**
```html
<a href="mailto:test@example.com">test@example.com</a>
```

**Current Output:**
```markdown
<test@example.com>
```

**Expected Pattern Not Found:**
```
Expected pattern: /mailto:test@example\.com/
```

**Impact:**
- Email links don't work as clickable links
- Markdown `<email>` syntax may or may not render as link (depends on parser)
- Users have to manually copy/paste email addresses
- **tel:** links may have same issue

**Expected Output:**
```markdown
[test@example.com](mailto:test@example.com)
```

Or at minimum:
```markdown
<mailto:test@example.com>
```

**Why This Matters:**
- Breaks functionality - users expect to click email/phone links
- Accessibility issue - screen readers expect proper link markup
- Mobile devices won't trigger email/phone apps

---

## Test Results Summary

```
Test Suites: 1 failed, 1 total
Tests:       3 failed, 19 passed, 22 total
```

**Failure Rate:** 13.6% (3 out of 22 tests)

### All Rendering Tests:

**List Rendering (3 tests)**
- ✅ nested lists maintain proper indentation
- ✅ consecutive ordered lists do not merge
- ❌ list formatting does not break with inconsistent indentation

**Image References (5 tests)**
- ✅ converts absolute image paths correctly
- ✅ handles images with spaces in filename
- ✅ images without src do not create broken markdown
- ✅ image alt text is preserved
- ✅ picture elements are handled

**Link Conversion (5 tests)**
- ✅ converts .php links to clean URLs
- ✅ preserves anchor links
- ✅ handles query strings in links
- ❌ handles links with no href
- ❌ preserves mailto and tel links

**Table Rendering (4 tests)**
- ✅ simple tables convert to markdown tables
- ✅ table headers are differentiated from body
- ✅ pipes in table content are escaped
- ✅ colspan is handled gracefully

**Heading Hierarchy (5 tests)**
- ✅ headings convert to proper markdown levels
- ✅ multiple H1s are handled
- ✅ heading formatting is preserved
- ✅ special characters in headings do not break markdown
- ✅ empty headings are removed or handled

---

## How to Fix

### Bug #1: Invalid Markdown Lines

**File:** `utils/content-processor.js` or `utils/pandoc-converter.js`

**Fix:**
```javascript
// After pandoc conversion, validate line starts
const lines = content.split('\n');
const validStarts = /^(\s*[-*+]|\s*\d+\.|\s*#|\[|>|\s*$|[A-Za-z])/;

const cleanedLines = lines.map(line => {
  if (!line.match(validStarts)) {
    // Fix line or log warning
    console.warn(`Invalid line start: ${line.substring(0, 20)}`);
  }
  return line;
});

return cleanedLines.join('\n');
```

### Bug #2: Empty href

**File:** `utils/content-processor.js`

**Fix:**
```javascript
// Remove links with empty href
content = content.replace(/\[([^\]]+)\]\(\)/g, '$1');
```

### Bug #3: mailto: Links

**File:** Check pandoc conversion or link processing

**Fix:**
```javascript
// Preserve mailto: and tel: links
content = content.replace(
  /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g,
  '[$1](mailto:$1)'
);
```

Or configure pandoc to preserve these links properly.

---

## Verification

Run tests after fixes:

```bash
npm test -- rendering-bugs

# Should show:
# Tests: 22 passed, 22 total
```

Check actual output:

```bash
node scripts/importer/index.js
# Check converted markdown files for:
# - No invalid line starts
# - No [text]() empty links
# - Proper mailto: links
```

---

## Why These Are Real Bugs

Unlike the security "bugs" earlier, these affect **actual user-facing output**:

✅ **Bug #1** - Users see broken lists and formatting
✅ **Bug #2** - Users click links that do nothing
✅ **Bug #3** - Users can't click email/phone links

These are **rendering bugs** that affect the **final HTML output** when markdown is converted.

---

## Additional Rendering Issues to Test

Not yet found but worth testing:

- [ ] Inline code with backticks in lists
- [ ] Bold/italic nesting (`***text***`)
- [ ] Markdown inside HTML blocks
- [ ] Horizontal rules (`---`) vs frontmatter
- [ ] Blockquotes with nested elements
- [ ] Definition lists
- [ ] Footnotes
- [ ] Task lists (`- [ ]`)

---

## Conclusion

✅ Found 3 real rendering bugs that affect user experience
✅ All are in the actual converted markdown output
✅ All can be reproduced and have clear fixes
✅ Tests serve as regression prevention

These bugs matter because they affect what users see on the final website!
