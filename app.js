// Supabase Configuration
const SUPABASE_URL = 'https://pnplxodtpkasiwguugbj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pRnfgV2V8E9Zrf9rqvqQ8A_ESBRSW7T';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Current user state
let currentUser = null;
let userProfile = null;

// ==================== Page Navigation ====================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

function showDashboardSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-section="${sectionId}"]`).classList.add('active');
    
    if (sectionId === 'jobs') loadJobs();
    if (sectionId === 'profile') loadProfile();
}

// ==================== Authentication ====================

async function handleLogin(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('login-error');
    errorDiv.classList.add('hidden');
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        return;
    }
    
    currentUser = data.user;
    await loadUserProfile();
    showDashboard();
}

async function handleSignup(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('signup-error');
    errorDiv.classList.add('hidden');
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                role: role
            }
        }
    });
    
    if (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        return;
    }
    
    // Create profile
    if (data.user) {
        await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: name,
            role: role,
            email: email
        });
    }
    
    alert('Account created! Please check your email to verify, then login.');
    showPage('login');
}

async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    userProfile = null;
    showPage('landing');
}

async function loadUserProfile() {
    if (!currentUser) return;
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
    
    if (data) {
        userProfile = data;
    } else {
        // Profile doesn't exist, create it
        const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
                id: currentUser.id,
                email: currentUser.email,
                full_name: currentUser.user_metadata?.full_name || 'User'
            })
            .select()
            .single();
        userProfile = newProfile;
    }
}

function showDashboard() {
    showPage('dashboard');
    document.getElementById('user-name').textContent = userProfile?.full_name || currentUser.email;
    loadJobs();
}

// ==================== Jobs ====================

async function loadJobs() {
    const jobsList = document.getElementById('jobs-list');
    jobsList.innerHTML = '<p class="loading">Loading jobs...</p>';
    
    if (!currentUser) {
        await checkSession();
        if (!currentUser) {
            jobsList.innerHTML = '<p class="loading">Please login to view jobs.</p>';
            return;
        }
    }
    
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
    
    if (error) {
        jobsList.innerHTML = `<p class="error">Error loading jobs: ${error.message}</p>`;
        return;
    }
    
    if (!jobs || jobs.length === 0) {
        jobsList.innerHTML = '<p class="loading">No jobs yet. Create your first job!</p>';
        return;
    }
    
    jobsList.innerHTML = jobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <div class="job-vin">${job.vin || 'No VIN'}</div>
                    <div class="job-vehicle">${job.vehicle || 'Unknown Vehicle'}</div>
                </div>
                <span class="job-status status-${job.status || 'pending'}">${formatStatus(job.status)}</span>
            </div>
            <div class="job-meta">
                <div>👤 ${job.customer_name || 'No customer'}</div>
                <div>📍 ${job.location || 'No location'}</div>
                <div>📅 ${formatDate(job.created_at)}</div>
            </div>
            ${job.notes ? `<p style="margin-top: 12px; color: var(--text-muted);">${job.notes}</p>` : ''}
        </div>
    `).join('');
}

async function handleNewJob(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('new-job-error');
    errorDiv.classList.add('hidden');
    
    const vin = document.getElementById('job-vin').value.toUpperCase();
    const customer = document.getElementById('job-customer').value;
    const phone = document.getElementById('job-phone').value;
    const vehicle = document.getElementById('job-vehicle').value;
    const location = document.getElementById('job-location').value;
    const notes = document.getElementById('job-notes').value;
    
    const { data, error } = await supabase
        .from('jobs')
        .insert({
            user_id: currentUser.id,
            vin: vin,
            customer_name: customer,
            customer_phone: phone,
            vehicle: vehicle,
            location: location,
            notes: notes,
            status: 'pending'
        })
        .select()
        .single();
    
    if (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        return;
    }
    
    // Clear form
    document.getElementById('new-job-form').reset();
    document.getElementById('vin-result').classList.add('hidden');
    
    // Show success and go to jobs list
    showDashboardSection('jobs');
}

// ==================== VIN Decoding ====================

async function decodeVIN() {
    const vin = document.getElementById('job-vin').value.toUpperCase();
    const resultDiv = document.getElementById('vin-result');
    
    if (vin.length !== 17) {
        resultDiv.innerHTML = '<p style="color: var(--error);">VIN must be 17 characters</p>';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    resultDiv.innerHTML = '<p>Decoding VIN...</p>';
    resultDiv.classList.remove('hidden');
    
    try {
        // Use NHTSA API for VIN decoding
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
        const data = await response.json();
        
        const results = data.Results || [];
        const getValue = (variable) => results.find(r => r.Variable === variable)?.Value || '';
        
        const year = getValue('Model Year');
        const make = getValue('Make');
        const model = getValue('Model');
        const trim = getValue('Trim');
        const engine = getValue('Displacement (L)');
        
        if (make && model) {
            const vehicleStr = `${year} ${make} ${model} ${trim}`.trim();
            document.getElementById('job-vehicle').value = vehicleStr;
            
            resultDiv.innerHTML = `
                <p><strong>Year:</strong> ${year}</p>
                <p><strong>Make:</strong> ${make}</p>
                <p><strong>Model:</strong> ${model}</p>
                <p><strong>Trim:</strong> ${trim || 'N/A'}</p>
                <p><strong>Engine:</strong> ${engine ? engine + 'L' : 'N/A'}</p>
            `;
        } else {
            resultDiv.innerHTML = '<p style="color: var(--warning);">Could not decode VIN. Please enter vehicle manually.</p>';
        }
    } catch (err) {
        resultDiv.innerHTML = `<p style="color: var(--error);">Error decoding VIN: ${err.message}</p>`;
    }
}

// ==================== Profile ====================

async function loadProfile() {
    if (!userProfile) return;
    
    document.getElementById('profile-name').value = userProfile.full_name || '';
    document.getElementById('profile-shop').value = userProfile.shop_name || '';
    document.getElementById('profile-phone').value = userProfile.phone || '';
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('profile-name').value;
    const shop = document.getElementById('profile-shop').value;
    const phone = document.getElementById('profile-phone').value;
    
    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: name,
            shop_name: shop,
            phone: phone
        })
        .eq('id', currentUser.id);
    
    if (error) {
        alert('Error updating profile: ' + error.message);
    } else {
        userProfile.full_name = name;
        userProfile.shop_name = shop;
        userProfile.phone = phone;
        document.getElementById('user-name').textContent = name;
        alert('Profile updated!');
    }
}

// ==================== Helpers ====================

function formatStatus(status) {
    if (!status) return 'Pending';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        await loadUserProfile();
        return true;
    }
    return false;
}

// ==================== Initialize ====================

document.addEventListener('DOMContentLoaded', async () => {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await loadUserProfile();
        showDashboard();
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            await loadUserProfile();
            showDashboard();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            userProfile = null;
            showPage('landing');
        }
    });
});
