// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.navbar')) {
            navMenu.classList.remove('active');
        }
    });
});

// Utility function to generate unique booking ID
function generateBookingId() {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 9);
}

// Utility function to format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Utility function to encode URL parameters
function encodeParam(str) {
    return encodeURIComponent(str);
}

// EmailJS initialization with error handling
(function() {
    try {
        // Initialize EmailJS with your public key
        emailjs.init("bLzH9fK_6I9ow_l9z");
        console.log('EmailJS initialized successfully');
    } catch (error) {
        console.error('Failed to initialize EmailJS:', error);
    }
})();

// Send booking request to admin with retry logic
async function sendBookingToAdmin(bookingData, retryCount = 0) {
    const maxRetries = 3;
    
    // Generate accept and decline links
    const baseUrl = window.location.origin;
    const acceptLink = `${baseUrl}/onlyadmin?action=accept&bookingId=${encodeParam(bookingData.bookingId)}&userEmail=${encodeParam(bookingData.userEmail)}&userName=${encodeParam(bookingData.userName)}&service=${encodeParam(bookingData.service)}&date=${encodeParam(bookingData.date)}&timeSlots=${encodeParam(bookingData.timeSlots)}`;
    const declineLink = `${baseUrl}/onlyadmin?action=decline&bookingId=${encodeParam(bookingData.bookingId)}&userEmail=${encodeParam(bookingData.userEmail)}&userName=${encodeParam(bookingData.userName)}&service=${encodeParam(bookingData.service)}&date=${encodeParam(bookingData.date)}&timeSlots=${encodeParam(bookingData.timeSlots)}`;
    const adminPanelLink = `${baseUrl}/onlyadmin`;

    // Prepare email parameters with validation
    const templateParams = {
        booking_id: bookingData.bookingId || 'N/A',
        service_name: bookingData.service || 'N/A',
        selected_date: bookingData.date || 'N/A',
        time_slots_list: bookingData.timeSlots || 'N/A',
        user_name: bookingData.userName || 'N/A',
        user_phone: bookingData.userPhone || 'N/A',
        user_email: bookingData.userEmail || 'N/A',
        user_description: bookingData.description || 'No additional description provided',
        photo_link_or_status: bookingData.photoStatus || 'No photo attached',
        accept_link: acceptLink,
        decline_link: declineLink,
        admin_panel_link: adminPanelLink,
        to_email: 'admin@handypro.com' // Add admin email
    };

    try {
        // Send email using EmailJS with timeout
        const response = await Promise.race([
            emailjs.send('service_8i06iw8', 'template_yfe14di', templateParams),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Email send timeout')), 30000)
            )
        ]);
        
        console.log('Email sent successfully:', response);
        return response;
    } catch (error) {
        console.error(`Email send attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount < maxRetries - 1) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            return sendBookingToAdmin(bookingData, retryCount + 1);
        }
        
        throw error;
    }
}

// Send status update to user with retry logic
async function sendStatusUpdateToUser(statusData, retryCount = 0) {
    const maxRetries = 3;
    const isAccepted = statusData.status === 'accepted';
    
    const templateParams = {
        email_subject: isAccepted ?
            `Your Booking for ${statusData.service} is Confirmed!` :
            `Update on your Booking Request for ${statusData.service}`,
        user_first_name: statusData.userFirstName || 'Valued Customer',
        status_heading_color: isAccepted ? '#2E8B57' : '#D32F2F',
        status_heading_text: isAccepted ?
            'Your Booking is Confirmed!' :
            'Important Update on Your Request',
        status_primary_message: isAccepted ?
            'Great news! Your booking for the service below has been confirmed.' :
            'Unfortunately, we have to inform you that we cannot fulfill your booking request for the service below at this time.',
        service_name: statusData.service || 'N/A',
        selected_date: statusData.date || 'N/A',
        time_slots_list: statusData.timeSlots || 'N/A',
        admin_message: statusData.adminMessage || '',
        admin_message_label: isAccepted ? 'Message from the handyman:' : 'Reason provided:',
        status_secondary_message: isAccepted ?
            'We look forward to serving you!' :
            'We apologize for any inconvenience this may cause. Please feel free to try booking for another date or contact us.',
        to_email: statusData.userEmail // Add recipient email
    };

    try {
        // Send email using EmailJS with timeout
        const response = await Promise.race([
            emailjs.send('service_8i06iw8', 'template_r1zmfvr', templateParams),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Email send timeout')), 30000)
            )
        ]);
        
        console.log('Status update email sent successfully:', response);
        return response;
    } catch (error) {
        console.error(`Status email attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount < maxRetries - 1) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            return sendStatusUpdateToUser(statusData, retryCount + 1);
        }
        
        throw error;
    }
}

// Store booking request in localStorage for admin panel
function storeBookingRequest(bookingData) {
    const requests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
    requests.push({
        ...bookingData,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('bookingRequests', JSON.stringify(requests));
}

// Get blocked dates from localStorage
function getBlockedDates() {
    return JSON.parse(localStorage.getItem('blockedDates') || '{}');
}

// Get blocked time slots from localStorage
function getBlockedTimeSlots() {
    return JSON.parse(localStorage.getItem('blockedTimeSlots') || '{}');
}

// Check if a date is blocked
function isDateBlocked(date) {
    const blockedDates = getBlockedDates();
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates[dateStr] === true;
}

// Check if a time slot is blocked for a specific date
function isTimeSlotBlocked(date, timeSlot) {
    const blockedTimeSlots = getBlockedTimeSlots();
    const dateStr = date.toISOString().split('T')[0];
    return blockedTimeSlots[dateStr] && blockedTimeSlots[dateStr].includes(timeSlot);
}

// Show success message with improved visibility
function showSuccessMessage(message, targetElement) {
    // Remove any existing messages
    const existingMessages = targetElement.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    messageDiv.style.animation = 'slideIn 0.3s ease-out';
    targetElement.insertBefore(messageDiv, targetElement.firstChild);
    
    // Scroll to message on mobile
    if (window.innerWidth <= 768) {
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Show error message with improved visibility
function showErrorMessage(message, targetElement) {
    // Remove any existing messages
    const existingMessages = targetElement.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    messageDiv.style.animation = 'slideIn 0.3s ease-out';
    targetElement.insertBefore(messageDiv, targetElement.firstChild);
    
    // Scroll to message on mobile
    if (window.innerWidth <= 768) {
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 7000);
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number format
function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Handle file upload
function handleFileUpload(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            reject('File size must be less than 5MB');
            return;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            reject('Only image files (JPEG, PNG, GIF) are allowed');
            return;
        }

        // Convert to base64 for EmailJS
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve({
                name: file.name,
                data: e.target.result
            });
        };
        reader.onerror = function() {
            reject('Error reading file');
        };
        reader.readAsDataURL(file);
    });
}

// Initialize smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});