# REGALIA MALL House V2 Copilot Instructions

## Core product rules
- Keep the storefront as a pure HTML frame. `index.html` is the canonical entry point and must remain plain HTML with inline CSS/JS only.
- Do not introduce React, Next.js, Vue, Svelte, or any JavaScript framework into this project.
- Do not convert the app into a SPA framework shell. Preserve the lightweight static architecture.
- Keep the project implementation simple, fast, and static-first.

## Brand and storefront structure
- The mall experience must keep 4 main doors: BUY, RENT, BRANDING, and PLAINS.
- Maintain the REGALIA MALL luxury look with black, gold, and premium retail styling.
- Respect the current shell layout, navigation, subfilters, and modal product experience unless a direct change is requested.
- Use accessible semantic HTML, clear buttons, and readable text.

## Shop and inventory constraints
- The mall must support up to 100 shops maximum.
- Shop sizes must be represented in the set: 9, 18, 36, 72, and 81.
- Product sizing must include OSFM and standard size ranges S, M, L, with room for variation in extended sizing as requested.
- Keep product and shop metadata compact and structured for easy Cloudflare D1 insertion.

## Data architecture
- Product media belongs in Cloudflare R2.
- Product/shop records and metadata belong in Cloudflare D1.
- Use a clean separation between storefront presentation and persistence.
- Prefer static, predictable data contracts over over-engineering.

## Code standards
- Keep JavaScript plain and browser-safe; avoid modern build tooling unless explicitly required.
- Favor small, explicit functions and direct DOM operations.
- Do not add unnecessary dependencies or heavy runtime libraries.
- Be careful with image fallbacks and placeholder handling for remote media.

## Safety and scope
- Do not change the project away from the pure HTML frame without explicit instruction.
- Do not add framework code, TypeScript compilation steps, or React code generation.
- Do not broaden scope into unrelated e-commerce systems outside the REGALIA MALL House V2 spec.
- When building new features, keep them aligned with the mall model, shop inventory sizing, and Cloudflare storage architecture.

## Expected working style
- Keep edits surgical and precise.
- Preserve the user-facing experience while improving maintainability.
- When possible, use simple static data objects and minimal logic instead of large abstraction layers.
- Keep the codebase consistent with the current black-and-gold storefront tone and the existing 4-door structure.
