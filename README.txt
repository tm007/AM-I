AM I — deploy notes (v20)
--------------------------------
1) Upload *contents* of this folder to Cloudflare Pages (Direct Upload).
2) Ensure root contains index.html and /assets.
3) Portraits use PNG: /assets/cameron.png, /assets/milo.png
   /assets/hero-bg.gif with a real animated GIF (same filename). The CSS prefers the GIF first,
   and will fall back to the JPG if the GIF is missing.
5) After upload, purge cache in Cloudflare -> Purge Everything, then hard refresh.
