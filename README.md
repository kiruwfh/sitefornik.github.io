# Professional Handyman Services Booking Website

A modern, responsive website for booking handyman services with an interactive calendar system and comprehensive admin panel.

## Features

### User Features
- **Service Browsing**: View detailed information about all available services
- **Interactive Calendar**: Select dates for booking with visual indicators for availability
- **Time Slot Selection**: Choose up to 3 time slots (consecutive or non-consecutive)
- **Photo Upload**: Optional photo upload for job areas
- **Email Notifications**: Automatic booking confirmations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Features
- **Password Protected Admin Panel**: Secure access at `/onlyadmin`
- **Booking Management**: Accept or decline booking requests with custom messages
- **Calendar Management**: Block specific dates or time slots
- **Email Integration**: Direct action links in admin notification emails
- **Persistent Login**: Cookie-based authentication for convenience

## Services Offered

1. **Lawn Mowing** - Professional lawn care services
2. **Car Washing** - Complete vehicle cleaning at your location
3. **Fence Painting and Wraps** - Transform and protect your fence
4. **Window Washing** - Crystal clear windows inside and out
5. **Furniture Assembly** - Expert assembly for all furniture types
6. **Garage Clean-up** - Complete garage organization
7. **Minor Fixes** - Small repairs and maintenance tasks

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Email Service**: EmailJS for booking notifications
- **Storage**: LocalStorage for admin data persistence
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Inter & Roboto from Google Fonts

## Setup Instructions

### 1. EmailJS Configuration

The site uses EmailJS with the following configuration:
- **Service ID**: `service_8i06iw8`
- **Public Key**: `bLzH9fK_6I9ow_l9z`
- **Template IDs**:
  - Admin notifications: `template_yfe14di`
  - User confirmations: `template_r1zmfvr`

### 2. Admin Access

- **URL**: `yoursite.com/onlyadmin`
- **Password**: `0-d5x|.?<n%"_[zy_8w2Tw{riHvS2q`

### 3. File Structure

```
/
├── index.html              # Homepage
├── services.html           # Services listing
├── pricing.html            # Pricing information
├── schedule.html           # Booking calendar
├── contact.html            # Contact form
├── onlyadmin.html          # Admin panel
├── .htaccess               # URL rewriting rules
├── css/
│   └── styles.css          # Main stylesheet
└── js/
    ├── main.js             # Core functionality
    ├── calendar.js         # Calendar and booking logic
    ├── contact.js          # Contact form handler
    └── admin.js            # Admin panel functionality
```

### 4. Deployment

1. Upload all files to your web server
2. Ensure `.htaccess` is properly configured for your server
3. Test EmailJS integration
4. Update contact information in footer sections

## Email Workflow

1. **User submits booking** → Email sent to admin with action links
2. **Admin clicks Accept/Decline** → Redirected to admin panel
3. **Admin adds message** → Confirmation email sent to user
4. **Booking status updated** → Reflected in admin dashboard

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

- Admin password is hardcoded (consider implementing a more secure authentication system for production)
- EmailJS keys are exposed in client-side code (normal for EmailJS, but consider backend implementation for enhanced security)
- No server-side validation (implement for production use)

## Future Enhancements

- Database integration for booking storage
- Payment processing integration
- SMS notifications
- Advanced reporting and analytics
- Multi-language support
- Service provider scheduling system

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or customization requests, please contact the development team.