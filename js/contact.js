// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Validate email
            if (!validateEmail(email)) {
                showErrorMessage('Please enter a valid email address', document.getElementById('contactEmail'));
                return;
            }
            
            // Validate phone if provided
            if (phone && !validatePhone(phone)) {
                showErrorMessage('Please enter a valid phone number', document.getElementById('contactPhone'));
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const submitText = document.getElementById('contactSubmitText');
            const submitLoading = document.getElementById('contactSubmitLoading');
            
            submitBtn.disabled = true;
            submitText.style.display = 'none';
            submitLoading.style.display = 'inline-block';
            
            try {
                // Prepare email parameters for admin
                const templateParams = {
                    from_name: name,
                    from_email: email,
                    phone: phone || 'Not provided',
                    subject: subject,
                    message: message,
                    reply_to: email
                };
                
                // Send email using EmailJS
                // Note: You'll need to create a contact form template in EmailJS
                // For now, we'll use the booking template as a placeholder
                const response = await emailjs.send('service_8i06iw8', 'template_yfe14di', {
                    booking_id: 'CONTACT-' + Date.now(),
                    service_name: 'Contact Form: ' + subject,
                    selected_date: new Date().toLocaleDateString(),
                    time_slots_list: 'N/A',
                    user_name: name,
                    user_phone: phone || 'Not provided',
                    user_email: email,
                    user_description: message,
                    photo_link_or_status: 'N/A',
                    accept_link: '#',
                    decline_link: '#',
                    admin_panel_link: window.location.origin + '/onlyadmin'
                });
                
                if (response) {
                    // Show success message
                    showSuccessMessage('Your message has been sent successfully! We\'ll get back to you within 24 hours.', contactForm);
                    
                    // Reset form
                    contactForm.reset();
                }
            } catch (error) {
                console.error('Error sending message:', error);
                showErrorMessage('There was an error sending your message. Please try again or call us directly.', contactForm);
            } finally {
                submitBtn.disabled = false;
                submitText.style.display = 'inline';
                submitLoading.style.display = 'none';
            }
        });
    }
});