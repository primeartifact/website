# PrimeArtifact

**Free, privacy-first online utility tools — no login, no ads, no tracking.**

Live site → [primeartifact.netlify.app](https://primeartifact.netlify.app)

---

## What it is

PrimeArtifact is a collection of browser-based tools that run entirely on the client. No backend, no database, no user accounts. Everything happens in your browser and nothing is sent to any server (except the contact form, which uses EmailJS).

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

## Deploying to Netlify

1. Push this repo to GitHub.
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**.
3. Select your repo. Set:
   - **Publish directory:** `.`  (root)
   - **Build command:** *(leave empty)*
4. Click **Deploy site**.

The `netlify.toml` in this repo handles headers, caching, redirects, and 404 behaviour automatically.

## Contact form setup (EmailJS)

The contact form uses [EmailJS](https://emailjs.com) to send emails without a backend. To activate it:

1. Create a free account at emailjs.com.
2. Add your Gmail (`primeartifact.contact@gmail.com`) as a service → copy the **Service ID**.
3. Create an email template with these variables:
   - `{{from_name}}` — sender's name
   - `{{from_email}}` — sender's email
   - `{{subject}}` — selected subject
   - `{{message}}` — message body
   Copy the **Template ID**.
4. Copy your **Public Key** from Account → API Keys.
5. Open `pages/contact.html` and replace the three placeholder values near the bottom of the `<script>` block:
   ```js
   var EMAILJS_PUBLIC_KEY  = 'YOUR_EMAILJS_PUBLIC_KEY';
   var EMAILJS_SERVICE_ID  = 'YOUR_EMAILJS_SERVICE_ID';
   var EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';
   ```

## SEO

- Every page has a unique `<title>`, `<meta description>`, canonical URL, Open Graph tags, Twitter Card tags, and JSON-LD structured data.
- `sitemap.xml` covers all tool and content pages.
- `robots.txt` blocks effect/lab pages and points to the sitemap.
- Effect pages (`effect-*.html`) are excluded from the sitemap and redirected to `/` in Netlify.

## Project structure

```
primeartifact/
├── index.html
├── favicon.svg
├── favicon.ico
├── sitemap.xml
├── robots.txt
├── netlify.toml
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
