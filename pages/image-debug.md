---
name: Image Debug
permalink: /image-debug/
layout: page
meta_title: Image Debug
meta_description: Temporary diagnostic page
eleventyExcludeFromCollections: true
---
<style>
  .dbg-label { font: 700 1.4rem monospace; background: #ffe100; padding: 0.5rem 1rem; display: inline-block; }
  .dbg-note { color: #666; font-size: 0.95rem; }
  .dbg-spacer { height: 70vh; }
  .dbg-row { margin: 1rem 0; }
</style>

<h1>Image debug matrix v2</h1>
<p>Scroll slowly to the bottom. Note which letters show a real photo and which show a grey/blurry box, a gap, or a broken image.</p>
<p class="dbg-note">A–G: known-working controls (eager/lazy/variants). H–K: reproductions of the broken pre-fix markup — spaces in the generated srcset URLs and <code>sizes="auto"</code>.</p>

<!-- A: current live markup (eager + LQIP + picture + srcset + sizes + width/height) -->
<div class="dbg-row"><span class="dbg-label">A (control: eager, current live markup)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="background-image: url('data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAABQBgCdASogABIAPm0ukEWkIqGYDAYAQAbEoAuzNlr4Atc2wLJ5x2k0lvZ01kV+EcbGnI435tfodeJOAAD+kIHW4sQZBUQ7uqguYs5fAD1YbJYMRzE7MyDbaYKxW/aNdomCySS40d4nK9sN5BkqyN+lBWHR7ChH+u06v5jmvUHmGz2+UZ/52e7Qt2ctssLdF/JHxfb6Lu8I1Abqf0vUr0BvoSRWgC1WFTVw0/AWnS7Spq6FY0qnoAXO2NxNCFTJZ0kabCLhtcbiYtldgpPTgFX4r/7lb16TwJmArlyeuBfMZyK/xuomWcu5wH2k2pziDiDIT1exxEL1m9T75Q7l3KFaIXiZbYl1Zz0LOz9thY9U6llcVrRzt5b7eEnHMbFQb3RhbQP0IsaQ8g6A6LxJRDj/gxxCUnr1+rjwE4brS/MbY8Y/oL09K9SbVj17u/EGP6RdjfwcB1UKx3Ej1pgAA'); aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <picture>
      <source type="image/webp" srcset="/img/crockenhill-install-240.webp 240w, /img/crockenhill-install-480.webp 480w, /img/crockenhill-install-900.webp 900w, /img/crockenhill-install-1300.webp 1300w, /img/crockenhill-install-2048.webp 2048w" sizes="(min-width: 1348px) 1250px, 100vw">
      <img alt="" loading="eager" decoding="async" src="/img/crockenhill-install-1300.jpeg" width="1300" height="731">
    </picture>
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- B: lazy + LQIP + picture + explicit sizes + width/height (worked on iPhone last time) -->
<div class="dbg-row"><span class="dbg-label">B (lazy, LQIP, picture, explicit sizes)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="background-image: url('data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAABQBgCdASogABIAPm0ukEWkIqGYDAYAQAbEoAuzNlr4Atc2wLJ5x2k0lvZ01kV+EcbGnI435tfodeJOAAD+kIHW4sQZBUQ7uqguYs5fAD1YbJYMRzE7MyDbaYKxW/aNdomCySS40d4nK9sN5BkqyN+lBWHR7ChH+u06v5jmvUHmGz2+UZ/52e7Qt2ctssLdF/JHxfb6Lu8I1Abqf0vUr0BvoSRWgC1WFTVw0/AWnS7Spq6FY0qnoAXO2NxNCFTJZ0kabCLhtcbiYtldgpPTgFX4r/7lb16TwJmArlyeuBfMZyK/xuomWcu5wH2k2pziDiDIT1exxEL1m9T75Q7l3KFaIXiZbYl1Zz0LOz9thY9U6llcVrRzt5b7eEnHMbFQb3RhbQP0IsaQ8g6A6LxJRDj/gxxCUnr1+rjwE4brS/MbY8Y/oL09K9SbVj17u/EGP6RdjfwcB1UKx3Ej1pgAA'); aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <picture>
      <source type="image/webp" srcset="/img/crockenhill-install-240.webp 240w, /img/crockenhill-install-480.webp 480w, /img/crockenhill-install-900.webp 900w, /img/crockenhill-install-1300.webp 1300w, /img/crockenhill-install-2048.webp 2048w" sizes="(min-width: 1348px) 1250px, 100vw">
      <img alt="" loading="lazy" decoding="async" src="/img/crockenhill-install-1300.jpeg" width="1300" height="731">
    </picture>
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- C: lazy, no LQIP background -->
<div class="dbg-row"><span class="dbg-label">C (lazy, no LQIP background)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <picture>
      <source type="image/webp" srcset="/img/crockenhill-install-240.webp 240w, /img/crockenhill-install-480.webp 480w, /img/crockenhill-install-900.webp 900w, /img/crockenhill-install-1300.webp 1300w, /img/crockenhill-install-2048.webp 2048w" sizes="(min-width: 1348px) 1250px, 100vw">
      <img alt="" loading="lazy" decoding="async" src="/img/crockenhill-install-1300.jpeg" width="1300" height="731">
    </picture>
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- D: lazy, plain div wrapper -->
<div class="dbg-row"><span class="dbg-label">D (lazy, plain div wrapper)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div style="max-width: min(2048px, 100%)">
    <picture>
      <source type="image/webp" srcset="/img/crockenhill-install-240.webp 240w, /img/crockenhill-install-480.webp 480w, /img/crockenhill-install-900.webp 900w, /img/crockenhill-install-1300.webp 1300w, /img/crockenhill-install-2048.webp 2048w" sizes="(min-width: 1348px) 1250px, 100vw">
      <img alt="" loading="lazy" decoding="async" src="/img/crockenhill-install-1300.jpeg" width="1300" height="731" style="max-width: 100%; height: auto; display: block;">
    </picture>
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- E: lazy, srcset on img directly, no picture -->
<div class="dbg-row"><span class="dbg-label">E (lazy, srcset on img, no picture)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="background-image: url('data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAABQBgCdASogABIAPm0ukEWkIqGYDAYAQAbEoAuzNlr4Atc2wLJ5x2k0lvZ01kV+EcbGnI435tfodeJOAAD+kIHW4sQZBUQ7uqguYs5fAD1YbJYMRzE7MyDbaYKxW/aNdomCySS40d4nK9sN5BkqyN+lBWHR7ChH+u06v5jmvUHmGz2+UZ/52e7Qt2ctssLdF/JHxfb6Lu8I1Abqf0vUr0BvoSRWgC1WFTVw0/AWnS7Spq6FY0qnoAXO2NxNCFTJZ0kabCLhtcbiYtldgpPTgFX4r/7lb16TwJmArlyeuBfMZyK/xuomWcu5wH2k2pziDiDIT1exxEL1m9T75Q7l3KFaIXiZbYl1Zz0LOz9thY9U6llcVrRzt5b7eEnHMbFQb3RhbQP0IsaQ8g6A6LxJRDj/gxxCUnr1+rjwE4brS/MbY8Y/oL09K9SbVj17u/EGP6RdjfwcB1UKx3Ej1pgAA'); aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <img alt="" loading="lazy" decoding="async" src="/img/crockenhill-install-1300.jpeg" srcset="/img/crockenhill-install-240.webp 240w, /img/crockenhill-install-480.webp 480w, /img/crockenhill-install-900.webp 900w, /img/crockenhill-install-1300.webp 1300w, /img/crockenhill-install-2048.webp 2048w" sizes="(min-width: 1348px) 1250px, 100vw" width="1300" height="731">
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- F: lazy, plain single-src img -->
<div class="dbg-row"><span class="dbg-label">F (lazy, plain src, no srcset)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="background-image: url('data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAABQBgCdASogABIAPm0ukEWkIqGYDAYAQAbEoAuzNlr4Atc2wLJ5x2k0lvZ01kV+EcbGnI435tfodeJOAAD+kIHW4sQZBUQ7uqguYs5fAD1YbJYMRzE7MyDbaYKxW/aNdomCySS40d4nK9sN5BkqyN+lBWHR7ChH+u06v5jmvUHmGz2+UZ/52e7Qt2ctssLdF/JHxfb6Lu8I1Abqf0vUr0BvoSRWgC1WFTVw0/AWnS7Spq6FY0qnoAXO2NxNCFTJZ0kabCLhtcbiYtldgpPTgFX4r/7lb16TwJmArlyeuBfMZyK/xuomWcu5wH2k2pziDiDIT1exxEL1m9T75Q7l3KFaIXiZbYl1Zz0LOz9thY9U6llcVrRzt5b7eEnHMbFQb3RhbQP0IsaQ8g6A6LxJRDj/gxxCUnr1+rjwE4brS/MbY8Y/oL09K9SbVj17u/EGP6RdjfwcB1UKx3Ej1pgAA'); aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <img alt="" loading="lazy" decoding="async" src="/img/crockenhill-install-900.webp" width="900" height="506">
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- G: lazy, no width/height attributes -->
<div class="dbg-row"><span class="dbg-label">G (lazy, no width/height attrs)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="background-image: url('data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAABQBgCdASogABIAPm0ukEWkIqGYDAYAQAbEoAuzNlr4Atc2wLJ5x2k0lvZ01kV+EcbGnI435tfodeJOAAD+kIHW4sQZBUQ7uqguYs5fAD1YbJYMRzE7MyDbaYKxW/aNdomCySS40d4nK9sN5BkqyN+lBWHR7ChH+u06v5jmvUHmGz2+UZ/52e7Qt2ctssLdF/JHxfb6Lu8I1Abqf0vUr0BvoSRWgC1WFTVw0/AWnS7Spq6FY0qnoAXO2NxNCFTJZ0kabCLhtcbiYtldgpPTgFX4r/7lb16TwJmArlyeuBfMZyK/xuomWcu5wH2k2pziDiDIT1exxEL1m9T75Q7l3KFaIXiZbYl1Zz0LOz9thY9U6llcVrRzt5b7eEnHMbFQb3RhbQP0IsaQ8g6A6LxJRDj/gxxCUnr1+rjwE4brS/MbY8Y/oL09K9SbVj17u/EGP6RdjfwcB1UKx3Ej1pgAA'); aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <picture>
      <source type="image/webp" srcset="/img/crockenhill-install-240.webp 240w, /img/crockenhill-install-480.webp 480w, /img/crockenhill-install-900.webp 900w, /img/crockenhill-install-1300.webp 1300w, /img/crockenhill-install-2048.webp 2048w" sizes="(min-width: 1348px) 1250px, 100vw">
      <img alt="" loading="lazy" decoding="async" src="/img/crockenhill-install-1300.jpeg">
    </picture>
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- H: EXACT original broken markup — space-named pipeline output, invalid srcset, sizes=auto, lazy -->
<div class="dbg-row"><span class="dbg-label">H (ORIGINAL BROKEN: spaces in srcset + sizes=auto + lazy)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="background-image: url('data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAABQBgCdASogABIAPm0ukEWkIqGYDAYAQAbEoAuzNlr4Atc2wLJ5x2k0lvZ01kV+EcbGnI435tfodeJOAAD+kIHW4sQZBUQ7uqguYs5fAD1YbJYMRzE7MyDbaYKxW/aNdomCySS40d4nK9sN5BkqyN+lBWHR7ChH+u06v5jmvUHmGz2+UZ/52e7Qt2ctssLdF/JHxfb6Lu8I1Abqf0vUr0BvoSRWgC1WFTVw0/AWnS7Spq6FY0qnoAXO2NxNCFTJZ0kabCLhtcbiYtldgpPTgFX4r/7lb16TwJmArlyeuBfMZyK/xuomWcu5wH2k2pziDiDIT1exxEL1m9T75Q7l3KFaIXiZbYl1Zz0LOz9thY9U6llcVrRzt5b7eEnHMbFQb3RhbQP0IsaQ8g6A6LxJRDj/gxxCUnr1+rjwE4brS/MbY8Y/oL09K9SbVj17u/EGP6RdjfwcB1UKx3Ej1pgAA'); aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <picture>
      <source type="image/webp" srcset="/img/test space file-240.webp 240w, /img/test space file-480.webp 480w, /img/test space file-900.webp 900w, /img/test space file-1300.webp 1300w, /img/test space file-2048.webp 2048w" sizes="auto">
      <img alt="" loading="lazy" decoding="async" src="/img/test space file-1300.jpeg" width="1300" height="731">
    </picture>
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- I: sizes=auto + lazy, VALID srcset (dash names) — the fix-1 state, wedged Chrome 154 -->
<div class="dbg-row"><span class="dbg-label">I (sizes=auto + lazy, valid srcset)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="background-image: url('data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAABQBgCdASogABIAPm0ukEWkIqGYDAYAQAbEoAuzNlr4Atc2wLJ5x2k0lvZ01kV+EcbGnI435tfodeJOAAD+kIHW4sQZBUQ7uqguYs5fAD1YbJYMRzE7MyDbaYKxW/aNdomCySS40d4nK9sN5BkqyN+lBWHR7ChH+u06v5jmvUHmGz2+UZ/52e7Qt2ctssLdF/JHxfb6Lu8I1Abqf0vUr0BvoSRWgC1WFTVw0/AWnS7Spq6FY0qnoAXO2NxNCFTJZ0kabCLhtcbiYtldgpPTgFX4r/7lb16TwJmArlyeuBfMZyK/xuomWcu5wH2k2pziDiDIT1exxEL1m9T75Q7l3KFaIXiZbYl1Zz0LOz9thY9U6llcVrRzt5b7eEnHMbFQb3RhbQP0IsaQ8g6A6LxJRDj/gxxCUnr1+rjwE4brS/MbY8Y/oL09K9SbVj17u/EGP6RdjfwcB1UKx3Ej1pgAA'); aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <picture>
      <source type="image/webp" srcset="/img/crockenhill-install-240.webp 240w, /img/crockenhill-install-480.webp 480w, /img/crockenhill-install-900.webp 900w, /img/crockenhill-install-1300.webp 1300w, /img/crockenhill-install-2048.webp 2048w" sizes="auto">
      <img alt="" loading="lazy" decoding="async" src="/img/crockenhill-install-1300.jpeg" width="1300" height="731">
    </picture>
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- J: space-named invalid srcset + EAGER (isolates invalid srcset from lazy) -->
<div class="dbg-row"><span class="dbg-label">J (spaces in srcset + eager)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="background-image: url('data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAABQBgCdASogABIAPm0ukEWkIqGYDAYAQAbEoAuzNlr4Atc2wLJ5x2k0lvZ01kV+EcbGnI435tfodeJOAAD+kIHW4sQZBUQ7uqguYs5fAD1YbJYMRzE7MyDbaYKxW/aNdomCySS40d4nK9sN5BkqyN+lBWHR7ChH+u06v5jmvUHmGz2+UZ/52e7Qt2ctssLdF/JHxfb6Lu8I1Abqf0vUr0BvoSRWgC1WFTVw0/AWnS7Spq6FY0qnoAXO2NxNCFTJZ0kabCLhtcbiYtldgpPTgFX4r/7lb16TwJmArlyeuBfMZyK/xuomWcu5wH2k2pziDiDIT1exxEL1m9T75Q7l3KFaIXiZbYl1Zz0LOz9thY9U6llcVrRzt5b7eEnHMbFQb3RhbQP0IsaQ8g6A6LxJRDj/gxxCUnr1+rjwE4brS/MbY8Y/oL09K9SbVj17u/EGP6RdjfwcB1UKx3Ej1pgAA'); aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <picture>
      <source type="image/webp" srcset="/img/test space file-240.webp 240w, /img/test space file-480.webp 480w, /img/test space file-900.webp 900w, /img/test space file-1300.webp 1300w, /img/test space file-2048.webp 2048w" sizes="auto">
      <img alt="" loading="eager" decoding="async" src="/img/test space file-1300.jpeg" width="1300" height="731">
    </picture>
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<!-- K: sizes=auto + EAGER (isolates native auto from lazy) -->
<div class="dbg-row"><span class="dbg-label">K (sizes=auto + eager)</span></div>
<div class="design-system"><div class="stack"><div class="stack">
  <div class="image-wrapper" style="background-image: url('data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAABQBgCdASogABIAPm0ukEWkIqGYDAYAQAbEoAuzNlr4Atc2wLJ5x2k0lvZ01kV+EcbGnI435tfodeJOAAD+kIHW4sQZBUQ7uqguYs5fAD1YbJYMRzE7MyDbaYKxW/aNdomCySS40d4nK9sN5BkqyN+lBWHR7ChH+u06v5jmvUHmGz2+UZ/52e7Qt2ctssLdF/JHxfb6Lu8I1Abqf0vUr0BvoSRWgC1WFTVw0/AWnS7Spq6FY0qnoAXO2NxNCFTJZ0kabCLhtcbiYtldgpPTgFX4r/7lb16TwJmArlyeuBfMZyK/xuomWcu5wH2k2pziDiDIT1exxEL1m9T75Q7l3KFaIXiZbYl1Zz0LOz9thY9U6llcVrRzt5b7eEnHMbFQb3RhbQP0IsaQ8g6A6LxJRDj/gxxCUnr1+rjwE4brS/MbY8Y/oL09K9SbVj17u/EGP6RdjfwcB1UKx3Ej1pgAA'); aspect-ratio: 16/9; max-width: min(2048px, 100%)">
    <picture>
      <source type="image/webp" srcset="/img/crockenhill-install-240.webp 240w, /img/crockenhill-install-480.webp 480w, /img/crockenhill-install-900.webp 900w, /img/crockenhill-install-1300.webp 1300w, /img/crockenhill-install-2048.webp 2048w" sizes="auto">
      <img alt="" loading="eager" decoding="async" src="/img/crockenhill-install-1300.jpeg" width="1300" height="731">
    </picture>
  </div>
</div></div></div>

<div class="dbg-spacer"></div>

<p>End of matrix — report which of H, I, J, K showed a photo vs blur/gap/broken image.</p>
