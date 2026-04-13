# PrimeArtifact

**Free, privacy-first online utility tools — no login, no ads, no tracking.**

Live site → [primeartifact.com](https://primeartifact.com)

---

## What it is

PrimeArtifact is a collection of browser-based tools that run entirely on the client. No backend, no database, no user accounts. Everything happens in your browser and nothing is sent to any server (except the contact form, which uses Web3Forms).

## Tools included

| Category     | Tool                     |
|--------------|--------------------------|
| Text         | Word & Character Counter |
| Text         | Text Case Converter      |
| Text         | Fancy Text Generator     |
| Text         | Lorem Ipsum Generator    |
| Generators   | Password Generator       |
| Generators   | QR Code Generator        |
| Converters   | Color Picker & Converter |
| Converters   | Number to Words          |
| Converters   | URL Encoder / Decoder    |
| Utility      | Age Calculator           |
| Utility      | Online Notepad           |

## Running locally

No build step needed. Just open `index.html` in any browser, or serve the root with any static server:

```bash
# Python (built-in)
python3 -m http.server 3000

# Node.js (npx, no install)
npx serve .
```

Then open `http://localhost:3000`.

## Deploying to Cloudflare Pages

1. Push this repo to GitHub.
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**.
3. Select your repo. Set:
   - **Build output directory:** `/`  (root)
   - **Build command:** *(leave empty)*
4. Click **Save and Deploy**.

The `_headers` and `_redirects` files in this repo handle security headers, caching, and URL redirects automatically.

## Contact form setup (Web3Forms)

The contact form uses [Web3Forms](https://web3forms.com) to send emails without a backend — works on any hosting provider.

1. Go to [web3forms.com](https://web3forms.com) and enter your email to get a free access key.
2. Open `pages/contact.html` and replace the access key value in the hidden input:
   ```html
   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY">
   ```
3. Form submissions will be emailed directly to your registered email address.

## SEO

- Every page has a unique `<title>`, `<meta description>`, canonical URL, Open Graph tags, Twitter Card tags, and JSON-LD structured data.
- `sitemap.xml` covers all tool and content pages.
- `robots.txt` blocks effect/lab pages and points to the sitemap.
- Effect pages (`effect-*.html`) are excluded from the sitemap and redirected to `/` via `_redirects`.

## Project structure

```
primeartifact/
├── index.html
├── favicon.svg
├── favicon.ico
├── sitemap.xml
├── robots.txt
├── _headers
├── _redirects
├── netlify.toml          # legacy — kept for reference
├── 404.html
├── css/
│   └── style.css
├── js/
│   ├── navbar.js
│   ├── theme.js
│   ├── effects.js
│   ├── interactive.js
│   └── word-counter.js
├── assets/
│   └── (fonts, icons, og-image.png)
├── pages/
│   ├── about.html
│   ├── contact.html
│   └── privacy.html
└── tools/
    ├── text/
    ├── generators/
    ├── converters/
    └── utility/
```

## License

MIT — free to use, modify, and distribute.
