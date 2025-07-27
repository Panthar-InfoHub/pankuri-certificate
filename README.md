
# 🌟 Pankhuri Certificate Management Platform

Welcome to **Pankhuri Certificate**! 🎓✨

This project is a thoughtfully built certificate generation platform designed to make managing and creating certificates feel simple and stress-free.

---

## 🚀 Features

- **Upload Certificates**: Effortlessly upload certificate data via CSV files or manual entry.
- **Display Certificates**: View and search certificates in a clean, organized interface.
- **Modern UI**: Enjoy a beautiful, responsive design powered by custom UI components.
- **Easy Navigation**: Intuitive page structure for quick access to all features.

---

## 🗂️ Project Structure

```
├── app/
│   ├── api/upload-certificate/route.js   # API for uploading certificates
│   ├── certificate/page.jsx              # Certificate display page
│   ├── display-csv/page.jsx              # CSV display page
│   ├── upload/page.jsx                   # Upload page
│   ├── layout.jsx, page.jsx, globals.css # App layout and global styles
├── components/
│   ├── certificate.jsx                   # Certificate component
│   ├── generateHtml.js                   # HTML generator
│   ├── Mannual.jsx                       # Manual entry component
│   └── ui/                               # Custom UI elements (Button, Card, Dialog, etc.)
├── lib/utils.js                          # Utility functions
├── public/                               # Static assets (SVGs, icons)
├── package.json, jsconfig.json, next.config.mjs, postcss.config.mjs
```

---

## 🛠️ Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pankhuri.git
   cd pankhuri
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run the development server**
   ```bash
   npm run dev
   ```
4. **Open in your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to explore the app.

---

## 📦 Dependencies

- [Next.js](https://nextjs.org/) 🐻‍❄️ྀིྀི
- [React](https://react.dev/) 🧸
- [Puppetter](https://postcss.org/) 🎨

---

## ✨ Usage

- **Upload Certificates**: Go to `/upload` to add new certificates via CSV or manual entry.
- **View Certificates**: Visit `/certificate` to browse and search certificates.
- **Display CSV Data**: Check `/display-csv` for a tabular view of uploaded data.
- **Generate HTML**: Use the certificate generator for printable HTML versions.

---

---

## 🤝 Contributing

We welcome contributions! 🌱

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 💬 Contact

For questions, feedback, or support, feel free to reach out:
- Email: connect@pantharinfohub.com
- GitHub Issues: [Open an issue](https://github.com/Panthar-InfoHub/pankuri-certificate/issues)

---

Thank you for using Pankhuri! 🌸 We hope it makes your certificate management effortless and enjoyable. If you love it, give us a ⭐ on GitHub!
