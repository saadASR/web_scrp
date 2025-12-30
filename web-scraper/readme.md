# 🔍 Web Scraper Pro

Web Scraper Pro is a **modern and secure web scraper** built with **Node.js, Express, and Cheerio**, featuring a responsive user interface and a clean MVC-based architecture.

---

## ✨ Main Features

* 🎯 **Full scraping**: titles, paragraphs, images, links, metadata
* 🚀 **Optimized performance**: 10-minute caching system
* 🔐 **Advanced security**: URL validation, anti-SSRF protection, rate limiting
* 📊 **Automatic statistics**: element counting & word count
* 🎨 **Modern UI**: gradients, animations, smooth interactions
* 📱 **Responsive design**: works on mobile, tablet, and desktop
* 📝 **Advanced logs**: Winston logging system
* ⚡ **Clean architecture**: routes, controllers, services, utils

---

## 📋 Requirements

* Node.js **>= 16.0.0**
* npm **>= 8.0.0**

---

## 🚀 Installation

1. Clone the project:

```bash
git clone https://github.com/NezarEa/web-scraper.git
cd web-scraper-pro
```

2. Install dependencies:

```bash
npm install
```

3. Create the `.env` file:

```bash
cp .env.example .env
```

4. Create the logs folder:

```bash
mkdir logs
```

5. Start the server:

```bash
npm run dev   # Development mode
npm start     # Production mode
```

6. Open the application:

```
http://localhost:3000
```

---

## 📁 Project Structure

```
project/
├── server.js
├── routes/
│   └── scraper.js
├── controllers/
│   └── scraperController.js
├── services/
│   └── scrapingService.js
├── utils/
│   ├── validators.js
│   └── logger.js
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── logs/
├── package.json
└── README.md
```

---

## 📡 API

### **POST /api/scrape**

Scrapes a URL and returns extracted data.

**Body:**

```json
{
  "url": "https://example.com"
}
```

**Response includes:**

* Title
* Metadata
* Headings
* Paragraphs
* Links
* Images
* Statistics
* Cache status

---

### **GET /api/cache/stats**

Returns cache statistics.

### **DELETE /api/cache/clear**

Clears the cache.

---

## 🛡️ Built-in Security

* Strict URL validation
* SSRF protection
* Blocking private & local IPs
* Rate limiting (20 requests / 15 min)
* 10-second timeout
* 10MB max response size
* HTML escaping (XSS protection)

---

## 🔄 Limitations

* Does not support JavaScript-rendered websites
* Cannot bypass CAPTCHAs
* 10-second maximum timeout
* Response size limited to 10MB

---

## 👨‍💻 Author

**ElAyachi Nezar**
GitHub: **@NezarEa**
