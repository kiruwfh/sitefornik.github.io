// Admin panel functionality
document.addEventListener('DOMContentLoaded', function() {
    // Admin password
    const ADMIN_PASSWORD = '0-d5x|.?<n%"_[zy_8w2Tw{riHvS2q';
    
    // DOM elements
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const tabs = document.querySelectorAll('.admin-tab');
    const requestsTab = document.getElementById('requestsTab');
    const calendarTab = document.getElementById('calendarTab');
    const responseModal = document.getElementById('responseModal');
    const closeResponseModal = document.getElementById('closeResponseModal');
    
    // Check if already logged in
    checkAuth();
    
    // Check for URL parameters (from email links)
    checkUrlParams();
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        
        if (password === ADMIN_PASSWORD) {
            // Set cookie for 7 days
            document.cookie = `adminAuth=true; max-age=${7 * 24 * 60 * 60}; path=/`;
            showDashboard();
        } else {
            showErrorMessage('Invalid password', loginForm);
        }
    });
    
    // Logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.cookie = 'adminAuth=; max-age=0; path=/';
        location.reload();
    });
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            if (this.dataset.tab === 'requests') {
                requestsTab.style.display = 'block';
                calendarTab.style.display = 'none';
            } else {
                requestsTab.style.display = 'none';
                calendarTab.style.display = 'block';
                loadBlockedDates();
            }
        });
    });
    
    // Modal close
    closeResponseModal.addEventListener('click', () => {
        responseModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === responseModal) {
            responseModal.style.display = 'none';
        }
    });
    
    // Check authentication
    function checkAuth() {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('adminAuth='));
        
        if (authCookie && authCookie.split('=')[1] === 'true') {
            showDashboard();
        }
    }
    
    // Show dashboard
    function showDashboard() {
        adminLogin.style.display = 'none';
        adminDashboard.style.display = 'block';
        loadBookingRequests();
        setupCalendarManagement();
    }
    
    // Check URL parameters
    function checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action && (action === 'accept' || action === 'decline')) {
            // Check if logged in
            const cookies = document.cookie.split(';');
            const authCookie = cookies.find(cookie => cookie.trim().startsWith('adminAuth='));
            
            if (authCookie && authCookie.split('=')[1] === 'true') {
                // Process the action
                const bookingData = {
                    bookingId: urlParams.get('bookingId'),
                    userEmail: decodeURIComponent(urlParams.get('userEmail')),
                    userName: decodeURIComponent(urlParams.get('userName')),
                    service: decodeURIComponent(urlParams.get('service')),
                    date: urlParams.get('date'),
                    timeSlots: decodeURIComponent(urlParams.get('timeSlots'))
                };
                
                showDashboard();
                setTimeout(() => {
                    openResponseModal(action, bookingData);
                }, 500);
            }
        }
    }
    
    // Load booking requests
    function loadBookingRequests() {
        const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
        const requestsContainer = document.getElementById('bookingRequests');
        
        if (bookingRequests.length === 0) {
            requestsContainer.innerHTML = '<p style="text-align: center; color: var(--gray-medium);">No pending booking requests</p>';
            return;
        }
        
        // Sort by timestamp (newest first)
        bookingRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        requestsContainer.innerHTML = bookingRequests.map(request => `
            <div class="booking-request" data-booking-id="${request.bookingId}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3>${request.service}</h3>
                        <p><strong>Date:</strong> ${request.date}</p>
                        <p><strong>Time Slots:</strong> ${request.timeSlots}</p>
                        <p><strong>Client:</strong> ${request.userName}</p>
                        <p><strong>Phone:</strong> ${request.userPhone}</p>
                        <p><strong>Email:</strong> ${request.userEmail}</p>
                        ${request.description ? `<p><strong>Description:</strong> ${request.description}</p>` : ''}
                        <p><strong>Status:</strong> <span class="booking-status ${request.status}">${request.status.toUpperCase()}</span></p>
                    </div>
                    <div>
                        ${request.status === 'pending' ? `
                            <button class="btn btn-primary" onclick="handleBookingAction('accept', '${request.bookingId}')">Accept</button>
                            <button class="btn btn-secondary" onclick="handleBookingAction('decline', '${request.bookingId}')" style="margin-left: 10px;">Decline</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Handle booking action
    window.handleBookingAction = function(action, bookingId) {
        const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
        const booking = bookingRequests.find(r => r.bookingId === bookingId);
        
        if (booking) {
            openResponseModal(action, booking);
        }
    };
    
    // Open response modal
    function openResponseModal(action, bookingData) {
        const modalTitle = document.getElementById('responseModalTitle');
        const bookingDetails = document.getElementById('bookingDetailsDisplay');
        const messageLabel = document.getElementById('messageLabel');
        const responseForm = document.getElementById('responseForm');
        
        modalTitle.textContent = action === 'accept' ? 'Accept Booking' : 'Decline Booking';
        messageLabel.textContent = action === 'accept' ? 
            'Add a message for the client (Optional)' : 
            'Reason for declining (Optional)';
        
        bookingDetails.innerHTML = `
            <p><strong>Service:</strong> ${bookingData.service}</p>
            <p><strong>Date:</strong> ${bookingData.date}</p>
            <p><strong>Time Slots:</strong> ${bookingData.timeSlots}</p>
            <p><strong>Client:</strong> ${bookingData.userName}</p>
            <p><strong>Email:</strong> ${bookingData.userEmail}</p>
        `;
        
        responseModal.style.display = 'block';
        
        // Handle form submission
        responseForm.onsubmit = async function(e) {
            e.preventDefault();
            
            const adminMessage = document.getElementById('adminMessage').value;
            const submitBtn = responseForm.querySelector('button[type="submit"]');
            const submitText = document.getElementById('responseSubmitText');
            const submitLoading = document.getElementById('responseSubmitLoading');
            
            submitBtn.disabled = true;
            submitText.style.display = 'none';
            submitLoading.style.display = 'inline-block';
            
            try {
                // Extract first name from full name
                const firstName = bookingData.userName.split(' ')[0];
                
                // Send status update to user
                const statusData = {
                    status: action === 'accept' ? 'accepted' : 'declined',
                    service: bookingData.service,
                    date: bookingData.date,
                    timeSlots: bookingData.timeSlots,
                    userFirstName: firstName,
                    adminMessage: adminMessage
                };
                
                await sendStatusUpdateToUser(statusData);
                
                // Update booking status in localStorage
                const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
                const bookingIndex = bookingRequests.findIndex(r => r.bookingId === bookingData.bookingId);
                
                if (bookingIndex !== -1) {
                    bookingRequests[bookingIndex].status = action === 'accept' ? 'accepted' : 'declined';
                    bookingRequests[bookingIndex].adminMessage = adminMessage;
                    bookingRequests[bookingIndex].processedAt = new Date().toISOString();
                    localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
                }
                
                // Show success message
                showSuccessMessage(`Booking ${action === 'accept' ? 'accepted' : 'declined'} successfully! Email sent to client.`, responseForm);
                
                // Close modal and refresh requests
                setTimeout(() => {
                    responseModal.style.display = 'none';
                    document.getElementById('adminMessage').value = '';
                    loadBookingRequests();
                }, 2000);
                
            } catch (error) {
                console.error('Error processing booking:', error);
                showErrorMessage('Error sending response. Please try again.', responseForm);
            } finally {
                submitBtn.disabled = false;
                submitText.style.display = 'inline';
                submitLoading.style.display = 'none';
            }
        };
    }
    
    // Calendar Management
    function setupCalendarManagement() {
        const blockDateBtn = document.getElementById('blockDateBtn');
        const blockTimeSlotsBtn = document.getElementById('blockTimeSlotsBtn');
        const adminTimeSlots = document.querySelectorAll('#adminTimeSlots .time-slot');
        
        // Time slot selection
        adminTimeSlots.forEach(slot => {
            slot.addEventListener('click', function() {
                this.classList.toggle('selected');
            });
        });
        
        // Block entire date
        blockDateBtn.addEventListener('click', function() {
            const dateInput = document.getElementById('blockDate');
            const date = dateInput.value;
            
            if (!date) {
                showErrorMessage('Please select a date', dateInput);
                return;
            }
            
            const blockedDates = getBlockedDates();
            blockedDates[date] = true;
            localStorage.setItem('blockedDates', JSON.stringify(blockedDates));
            
            showSuccessMessage('Date blocked successfully', dateInput.parentElement);
            dateInput.value = '';
            loadBlockedDates();
        });
        
        // Block time slots
        blockTimeSlotsBtn.addEventListener('click', function() {
            const dateInput = document.getElementById('blockSlotDate');
            const date = dateInput.value;
            const selectedSlots = Array.from(adminTimeSlots)
                .filter(slot => slot.classList.contains('selected'))
                .map(slot => slot.dataset.time);
            
            if (!date) {
                showErrorMessage('Please select a date', dateInput);
                return;
            }
            
            if (selectedSlots.length === 0) {
                showErrorMessage('Please select at least one time slot', document.getElementById('adminTimeSlots'));
                return;
            }
            
            const blockedTimeSlots = getBlockedTimeSlots();
            if (!blockedTimeSlots[date]) {
                blockedTimeSlots[date] = [];
            }
            
            selectedSlots.forEach(slot => {
                if (!blockedTimeSlots[date].includes(slot)) {
                    blockedTimeSlots[date].push(slot);
                }
            });
            
            localStorage.setItem('blockedTimeSlots', JSON.stringify(blockedTimeSlots));
            
            showSuccessMessage('Time slots blocked successfully', dateInput.parentElement);
            dateInput.value = '';
            adminTimeSlots.forEach(slot => slot.classList.remove('selected'));
            loadBlockedDates();
        });
    }
    
    // Load blocked dates and time slots
    function loadBlockedDates() {
        const blockedDates = getBlockedDates();
        const blockedTimeSlots = getBlockedTimeSlots();
        
        // Display blocked dates
        const blockedDatesList = document.getElementById('blockedDatesList');
        const dateEntries = Object.keys(blockedDates).filter(date => blockedDates[date]);
        
        if (dateEntries.length === 0) {
            blockedDatesList.innerHTML = '<p style="color: var(--gray-medium);">No dates blocked</p>';
        } else {
            blockedDatesList.innerHTML = dateEntries.map(date => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background-color: #f9f9f9; margin-bottom: 5px; border-radius: 5px;">
                    <span>${new Date(date + 'T00:00:00').toLocaleDateString()}</span>
                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 14px;" onclick="unblockDate('${date}')">Unblock</button>
                </div>
            `).join('');
        }
        
        // Display blocked time slots
        const blockedTimeSlotsList = document.getElementById('blockedTimeSlotsList');
        const slotEntries = Object.keys(blockedTimeSlots).filter(date => blockedTimeSlots[date].length > 0);
        
        if (slotEntries.length === 0) {
            blockedTimeSlotsList.innerHTML = '<p style="color: var(--gray-medium);">No time slots blocked</p>';
        } else {
            blockedTimeSlotsList.innerHTML = slotEntries.map(date => `
                <div style="margin-bottom: 15px;">
                    <strong>${new Date(date + 'T00:00:00').toLocaleDateString()}</strong>
                    ${blockedTimeSlots[date].map(slot => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 10px; background-color: #f9f9f9; margin: 5px 0; border-radius: 5px;">
                            <span>${slot}</span>
                            <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 12px;" onclick="unblockTimeSlot('${date}', '${slot}')">Unblock</button>
                        </div>
                    `).join('')}
                </div>
            `).join('');
        }
    }
    
    // Unblock date
    window.unblockDate = function(date) {
        const blockedDates = getBlockedDates();
        delete blockedDates[date];
        localStorage.setItem('blockedDates', JSON.stringify(blockedDates));
        loadBlockedDates();
    };
    
    // Unblock time slot
    window.unblockTimeSlot = function(date, slot) {
        const blockedTimeSlots = getBlockedTimeSlots();
        if (blockedTimeSlots[date]) {
            blockedTimeSlots[date] = blockedTimeSlots[date].filter(s => s !== slot);
            if (blockedTimeSlots[date].length === 0) {
                delete blockedTimeSlots[date];
            }
            localStorage.setItem('blockedTimeSlots', JSON.stringify(blockedTimeSlots));
            loadBlockedDates();
        }
    };
});