# Sites to Port to CDN and Registrar Migration Plan

*Created: 2026-03-23 · Repository: yogicapproach.github.io*

This document tracks the domain portfolio currently held at NameSilo and evaluates migration to Cloudflare Registrar + Cloudflare CDN/DNS.

---

## Domain Registration & Renewal Pricing: Cloudflare vs NameSilo

Prices in USD/year for 1-year term. Cloudflare charges registry wholesale + $0.18 ICANN fee, no markup. Registration = renewal (no first-year bait-and-switch).

| TLD | Cloudflare Reg/Renew | NameSilo Reg | NameSilo Renew | Verdict | Notes |
|-----|---------------------:|-------------:|---------------:|---------|-------|
| .com | $10.44 | $17.29 | $17.29 | ✅ CF wins (~$7/yr) | At-cost vs NameSilo markup |
| .net | $11.86 | $15.95 | $15.95 | ✅ CF wins (~$4/yr) | |
| .org | $9.77 | $9.49 | $10.79 | ⚖️ Toss-up | NS reg slightly cheaper; CF renew cheaper |
| .info | $19.20 | $4.75* | $29.49 | ⚠️ NS promo trap | *NS reg is promotional — renewal jumps to $29.49 |
| .me | $15.79 | $16.99 | $16.99 | ⚖️ Similar | NS may have promo reg codes |
| .cc | ~$20.00 | $3.19* | $9.99 | ⚠️ Check CF | *NS promo reg; renew $9.99. CF estimate ~$20 — verify |
| .app | $14.20 | $15.99 | $16.99 | ✅ CF wins | |
| .guru | ~$18–20 | ~$18.99 | ~$18.99 | ⚖️ Similar | Verify CF exact price at cfdomainpricing.com |
| .in | ❌ Not supported | ~$10.99 | ~$10.99 | 🔒 Stay at NS | Cloudflare does not offer .in |
| .de | ❌ Not supported | ~$9.99 | ~$9.99 | 🔒 Stay at NS | Cloudflare does not offer .de (community confirmed) |

### Key Findings

- **Migrate to Cloudflare:** `.com`, `.net`, `.app` — clear savings
- **Stay at NameSilo:** `.in`, `.de` — Cloudflare does not support these ccTLDs
- **Verify before moving:** `.cc`, `.guru` — pricing estimates only
- **Watch out for:** `.info` NameSilo renewal shock ($29.49 vs $19.20 at CF)
- Cloudflare requires its own nameservers for all registered domains (mandatory)
- Cloudflare Email Routing (free) replaces NameSilo email forwarding
- No parking pages at Cloudflare; use Redirect Rules for parked domains

---

## Cloudflare Features vs NameSilo

| Feature | Cloudflare | NameSilo |
|---------|-----------|---------|
| Email forwarding | ✅ Cloudflare Email Routing (free) | ✅ Free |
| WHOIS privacy | ✅ Free | ✅ Free |
| Parked domain pages | ❌ No ad parking | ✅ Yes (ad-supported) |
| URL redirect forwarding | ✅ Redirect Rules | ✅ Basic |
| DNS hosting | ✅ Excellent (Anycast) | ✅ Basic |
| API quality | ✅ Modern REST/JSON, scoped tokens | ⚠️ XML-based |
| Bulk management | ✅ Dashboard + API | ✅ Adequate |

---

## Migration Prerequisites

1. Domain must be **unlocked** at NameSilo (remove transfer lock)
2. Get **EPP/auth code** from NameSilo for each domain
3. Cloudflare account must exist at cloudflare.com
4. DNS records must be recreated in Cloudflare before transfer completes
5. Transfer takes ~5–7 days; domain continues to resolve normally during transfer
6. Cannot transfer a domain registered/transferred in the last 60 days (ICANN rule)

---

## Live Pricing Verification Links

- [Cloudflare exact prices — cfdomainpricing.com](https://cfdomainpricing.com)
- [Cloudflare supported TLDs — developers.cloudflare.com/registrar/top-level-domains/](https://developers.cloudflare.com/registrar/top-level-domains/)
- [NameSilo pricing — namesilo.com/pricing](https://www.namesilo.com/pricing)
- [Side-by-side comparison — domcomp.com](https://domcomp.com)

---

## Related Issues

- [yogicapproach/events #73](https://github.com/yogicapproach/events/issues/73) — Cloudflare DNS/CDN migration for yogicapproach.com (GitHub Pages)
- [yogicapproach/events #74](https://github.com/yogicapproach/events/issues/74) — Domain registration migration to Cloudflare Registrar
