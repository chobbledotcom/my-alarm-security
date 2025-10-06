# Security Vulnerabilities Found 🐛

## Summary

Found **5 security vulnerabilities** in the importer through aggressive edge case testing:

1. ❌ XSS via Script Tags in Frontmatter
2. ❌ Path Traversal in Image/Link URLs
3. ❌ file:// Protocol Local File Disclosure
4. ❌ Directory Traversal in Filename Slugs
5. ❌ SQL Injection Passthrough in Content

---

## 1. XSS via Script Tags in Frontmatter ⚠️ HIGH

**Status:** VULNERABLE

**Test:** `strips script tags from content`

**Issue:** Script tags from HTML titles are directly embedded into YAML frontmatter without escaping.

**Vulnerable Output:**
```yaml
---
header_text: "<script>alert('xss')</script> Widget"
meta_title: "<script>alert('xss')</script> Widget"
meta_description: "<script>alert("
---
```

**Attack Vector:**
- Malicious HTML file with `<title><script>alert('xss')</script></title>`
- Script tag ends up in frontmatter
- If frontmatter is rendered as HTML, XSS executes

**Impact:**
- Cross-site scripting attack possible
- Could steal session cookies, hijack accounts
- Affects any page rendering the frontmatter

**Fix Needed:**
- Strip HTML tags from metadata before adding to frontmatter
- Or escape HTML entities in YAML values

---

## 2. Path Traversal in Image/Link URLs ⚠️ HIGH

**Status:** VULNERABLE

**Test:** `prevents directory traversal in image paths`

**Issue:** Path traversal sequences like `../../../../etc/passwd` pass through unchanged into markdown.

**Vulnerable Output:**
```markdown
![Directory traversal](../../../../../../../../etc/passwd)
[File protocol](file:///etc/passwd)
```

**Attack Vector:**
- Malicious HTML with `<img src="../../../../etc/passwd">`
- Path traversal preserved in markdown
- If markdown processor follows paths, could leak local files

**Impact:**
- Potential local file disclosure
- Could read /etc/passwd, config files, ssh keys
- Depending on markdown processor behavior

**Fix Needed:**
- Sanitize image/link paths before conversion
- Remove or reject ../ sequences
- Validate paths stay within allowed directories

---

## 3. file:// Protocol Local File Disclosure ⚠️ MEDIUM

**Status:** VULNERABLE

**Test:** `sanitizes file:// protocol URLs`

**Issue:** `file://` protocol URLs are preserved in markdown output.

**Vulnerable Output:**
```markdown
[File protocol](file:///etc/passwd)
```

**Attack Vector:**
- HTML with `<a href="file:///etc/passwd">Link</a>`
- file:// URL preserved in markdown
- Browser or markdown processor might follow it

**Impact:**
- Local file system access via file:// protocol
- Information disclosure
- Varies by browser/processor security

**Fix Needed:**
- Block or remove file:// protocol URLs
- Whitelist allowed protocols (http, https, mailto)
- Reject dangerous protocols

---

## 4. Directory Traversal in Filename Slugs ⚠️ HIGH

**Status:** VULNERABLE

**Test:** `handles path traversal in filename itself`

**Issue:** Filenames with `../` pass through to slug generation unchanged.

**Test Case:**
```javascript
slugFromFilename('../../../etc/passwd.php.html')
// Returns: "../../../etc/passwd"
```

**Attack Vector:**
- Malicious filename: `products/../../../etc/passwd.php.html`
- Slug becomes: `../../../etc/passwd`
- Output file could be written outside intended directory

**Impact:**
- Files written to arbitrary locations
- Could overwrite system files
- Directory traversal attack

**Fix Needed:**
- Sanitize filenames before slug generation
- Remove all ../ sequences
- Validate output paths

---

## 5. SQL Injection Passthrough in Content ⚠️ LOW

**Status:** VULNERABLE

**Test:** `rejects SQL injection in price field`

**Issue:** SQL injection attempts in price fields pass through to markdown content.

**Vulnerable Output:**
```markdown
# Widget with Ridiculous Price

£999,999,999,999,999,999.99

-£100

£0.001

£1e10

£NaN

£Infinity

£DROP TABLE prices;
```

**Attack Vector:**
- HTML with `<p class="product-price">£DROP TABLE prices;</p>`
- SQL injection string preserved in markdown
- If markdown is processed into SQL query without escaping...

**Impact:**
- Low direct impact (markdown is static)
- Could affect downstream systems that parse prices
- If prices are extracted and used in SQL without sanitization

**Fix Needed:**
- Validate price format
- Reject non-numeric prices
- Or clearly mark as invalid

---

## Test Suite Statistics

**Total Tests:** 16 security tests
**Passed:** 11
**Failed:** 5

**Failure Rate:** 31% 🚨

---

## Recommendations

### Immediate Fixes (High Priority)

1. **Sanitize Metadata for Frontmatter**
   - Strip HTML tags from titles/descriptions
   - Escape YAML special characters
   - Validate no code injection

2. **Path Sanitization**
   - Remove ../ from all paths
   - Validate paths stay within bounds
   - Reject file:// and javascript: protocols

3. **Filename Sanitization**
   - Clean filenames before slug generation
   - Remove path traversal sequences
   - Validate output file paths

### Medium Priority

4. **Input Validation**
   - Validate price formats
   - Whitelist allowed protocols
   - Reject obviously malicious input

5. **Content Security Policy**
   - Document security assumptions
   - Add security warnings to README
   - Consider content sanitization library

### Testing Improvements

6. **Security Test Suite**
   - All 5 vulnerabilities now have failing tests
   - Tests serve as regression suite
   - Fix code until tests pass

---

## How to Verify Fixes

```bash
# Run security test suite
npm test -- security-and-edge-cases

# All tests should pass after fixes:
# ✓ strips script tags from content
# ✓ prevents directory traversal in image paths
# ✓ sanitizes file:// protocol URLs
# ✓ handles path traversal in filename itself
# ✓ rejects SQL injection in price field
```

---

## Additional Vulnerabilities to Test

Not yet tested but potentially vulnerable:

- [ ] ReDoS (Regular Expression Denial of Service)
- [ ] Billion Laughs YAML attack
- [ ] Symlink attacks in file operations
- [ ] Race conditions in file writes
- [ ] Memory exhaustion with huge files
- [ ] Unicode normalization attacks
- [ ] CRLF injection in frontmatter

---

## Conclusion

The importer has **significant security vulnerabilities** that need addressing before production use:

- ✅ Tests successfully found real bugs (not false positives)
- ❌ 5 critical security issues discovered
- 🔧 All have clear reproduction steps and fixes
- 📝 Comprehensive security test suite created

**Next Steps:** Fix vulnerabilities, re-run tests, add more security tests.
