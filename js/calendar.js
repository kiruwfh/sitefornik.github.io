// Calendar functionality
document.addEventListener('DOMContentLoaded', function() {
    // Calendar state
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTimeSlots = [];

    // DOM elements
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const bookingModal = document.getElementById('bookingModal');
    const closeModalBtn = document.getElementById('closeModal');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const bookingForm = document.getElementById('bookingForm');
    const timeSlotElements = document.querySelectorAll('.time-slot');

    // Initialize calendar
    renderCalendar();

    // Event listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    closeModalBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeModal();
        }
    });

    // Time slot selection
    timeSlotElements.forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.classList.contains('unavailable')) return;

            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedTimeSlots = selectedTimeSlots.filter(time => time !== this.dataset.time);
            } else {
                if (selectedTimeSlots.length < 3) {
                    this.classList.add('selected');
                    selectedTimeSlots.push(this.dataset.time);
                } else {
                    showErrorMessage('You can select up to 3 time slots only', this.parentElement);
                }
            }
        });
    });

    // Form submission
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate time slots
        if (selectedTimeSlots.length === 0) {
            showErrorMessage('Please select at least one time slot', document.getElementById('timeSlots'));
            return;
        }

        // Get form data
        const formData = new FormData(bookingForm);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const phone = formData.get('phone');
        const email = formData.get('email');
        const service = formData.get('service');
        const description = formData.get('description');
        const photoFile = formData.get('photo');

        // Validate email
        if (!validateEmail(email)) {
            showErrorMessage('Please enter a valid email address', document.getElementById('email'));
            return;
        }

        // Validate phone
        if (!validatePhone(phone)) {
            showErrorMessage('Please enter a valid phone number', document.getElementById('phone'));
            return;
        }

        // Show loading state
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const submitText = document.getElementById('submitText');
        const submitLoading = document.getElementById('submitLoading');
        
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline-block';

        try {
            // Handle photo upload if provided
            let photoStatus = 'No photo attached';
            if (photoFile && photoFile.size > 0) {
                try {
                    const photoData = await handleFileUpload(photoFile);
                    if (photoData) {
                        photoStatus = `Photo attached: ${photoData.name}`;
                    }
                } catch (error) {
                    showErrorMessage(error, document.getElementById('photo'));
                    submitBtn.disabled = false;
                    submitText.style.display = 'inline';
                    submitLoading.style.display = 'none';
                    return;
                }
            }

            // Prepare booking data
            const bookingData = {
                bookingId: generateBookingId(),
                service: service,
                date: formatDate(selectedDate),
                timeSlots: selectedTimeSlots.join(', '),
                userName: `${firstName} ${lastName}`,
                userFirstName: firstName,
                userPhone: phone,
                userEmail: email,
                description: description || '',
                photoStatus: photoStatus
            };

            // Send email to admin
            const response = await sendBookingToAdmin(bookingData);

            if (response) {
                // Store booking request
                storeBookingRequest(bookingData);

                // Show success message
                showSuccessMessage('Your booking request has been sent successfully! You will receive a confirmation email soon.', bookingForm);

                // Reset form
                bookingForm.reset();
                selectedTimeSlots = [];
                timeSlotElements.forEach(slot => slot.classList.remove('selected'));

                // Close modal after delay
                setTimeout(() => {
                    closeModal();
                }, 3000);
            }
        } catch (error) {
            console.error('Error sending booking:', error);
            showErrorMessage('There was an error sending your booking request. Please try again.', bookingForm);
        } finally {
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
        }
    });

    // Render calendar function
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        const firstDayIndex = firstDay.getDay();
        const lastDayIndex = lastDay.getDay();
        const nextDays = 7 - lastDayIndex - 1;

        // Update month display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;

        // Clear calendar
        calendarGrid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Previous month days
        for (let x = firstDayIndex; x > 0; x--) {
            const day = document.createElement('div');
            day.className = 'calendar-day disabled';
            day.textContent = prevLastDay.getDate() - x + 1;
            calendarGrid.appendChild(day);
        }

        // Current month days
        const today = new Date();
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.textContent = i;

            const currentDayDate = new Date(year, month, i);
            
            // Check if date is in the past
            if (currentDayDate < today.setHours(0, 0, 0, 0)) {
                day.classList.add('disabled');
            }
            // Check if date is today
            else if (currentDayDate.toDateString() === today.toDateString()) {
                day.classList.add('today');
            }
            // Check if date is blocked
            else if (isDateBlocked(currentDayDate)) {
                day.classList.add('blocked');
                day.title = 'This date is unavailable';
            }
            // Make future dates clickable
            else {
                day.addEventListener('click', () => selectDate(currentDayDate));
            }

            calendarGrid.appendChild(day);
        }

        // Next month days
        for (let j = 1; j <= nextDays; j++) {
            const day = document.createElement('div');
            day.className = 'calendar-day disabled';
            day.textContent = j;
            calendarGrid.appendChild(day);
        }
    }

    // Select date function
    function selectDate(date) {
        selectedDate = date;
        selectedDateDisplay.textContent = `Selected Date: ${formatDate(date)}`;
        
        // Reset time slots
        selectedTimeSlots = [];
        timeSlotElements.forEach(slot => {
            slot.classList.remove('selected');
            slot.classList.remove('unavailable');
            
            // Check if time slot is blocked for this date
            if (isTimeSlotBlocked(date, slot.dataset.time)) {
                slot.classList.add('unavailable');
                slot.title = 'This time slot is unavailable';
            }
        });

        // Open modal
        bookingModal.style.display = 'block';
    }

    // Close modal function
    function closeModal() {
        bookingModal.style.display = 'none';
        selectedTimeSlots = [];
        timeSlotElements.forEach(slot => slot.classList.remove('selected'));
    }
});