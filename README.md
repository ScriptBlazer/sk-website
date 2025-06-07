# Social Klick Website

A clean, responsive, and lightweight portfolio website for Social Klick, a video production company. Built with vanilla HTML, CSS, and JavaScript.

## Features

- Responsive design that works on all devices
- Clean and modern UI with smooth animations
- Mobile-friendly navigation
- Contact form with validation
- Portfolio showcase with video thumbnails
- Optimized for performance and SEO

## Project Structure

```
.
├── index.html              # Home page
├── about.html             # About Us page
├── contact.html           # Contact page
├── portfolio.html         # Main portfolio page
├── portfolio/            # Portfolio category pages
│   ├── corporate.html    # Corporate videos
│   ├── charity.html      # Charity campaigns
│   └── whatsapp.html     # WhatsApp status ads
├── css/
│   └── styles.css        # Main stylesheet
├── js/
│   └── main.js           # JavaScript functionality
└── images/               # Image assets
```

## Setup and Deployment

1. Clone the repository
2. Replace placeholder images in the `images` directory with actual content
3. Update video URLs in portfolio pages with actual AWS S3 links
4. Deploy to Firebase Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Deploy to Firebase
firebase deploy
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## Performance Optimization

- Optimized images and assets
- Minified CSS and JavaScript
- Lazy loading for images
- Efficient CSS animations
- Semantic HTML structure

## Contact

For any questions or support, please contact:

- Email: info@socialklick.com
- Hours: Sunday - Friday, 8:00 AM - 6:00 PM

## License

© 2024 Social Klick. All rights reserved.
