# Email Security Configuration (SPF & DMARC)

To ensure emails sent from Lexa AI are trusted and do not end up in spam, configure the following DNS records on your domain registrar (e.g., Cloudflare, Route53, Namecheap).

## 1. SPF Record (Sender Policy Framework)
Add a TXT record to authorize your email sending provider (e.g., Resend, SendGrid, Amazon SES).
- **Type:** TXT
- **Name:** @ (or lexa-ai.com)
- **Content:** \"v=spf1 include:_spf.yourprovider.com ~all\"
*(Replace _spf.yourprovider.com with the actual provider's SPF include)*

## 2. DMARC Record
Add a TXT record to instruct receivers on how to handle emails that fail SPF or DKIM.
- **Type:** TXT
- **Name:** _dmarc
- **Content:** \"v=DMARC1; p=none; rua=mailto:admin@lexa-ai.com;\"
*(Change \p=none\ to \p=quarantine\ or \p=reject\ after monitoring reports via the RUA email)*
