# CSS/SCSS Development Guidelines

## Core Principles
- Write minimal, nested SCSS code only
- Use semantic HTML with minimal classes
- All styles go in `css/theme.scss`
- **DO NOT modify anything above the `/* body_classes: */` comment (line 30)**

## Defined Variables
- Mobile breakpoint: 768px
- Base gap/spacing: 1rem
- Layout: CSS Grid
- Font scaling: Responsive
- Colors: Use existing CSS custom properties only (no new colors)

## SCSS Variables (add below line 30 only)
```scss
$mobile: 768px;
$gap: 1rem;
```

## Style Approach
- Use nesting for component styles
- Target semantic elements within containers
- Avoid utility classes
- Mobile-first responsive design
- Use CSS Grid for layouts
- Responsive typography with fluid scaling