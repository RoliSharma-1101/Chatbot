// API Integration Layer for UPSIDA Chatbot
// Handles all backend API calls as per the integration plan

class UPSIDAAPI {
  constructor() {
    this.baseURL = 'https://compl-reg-api.onrender.com'; // Replace with actual API base URL
    // this.baseURL= 'http://localhost:3000';
    this.apiKey = null; // Will be set during initialization
  }

  // Set API configuration
  setConfig(config) {
    this.baseURL = config.baseURL || this.baseURL;
    this.apiKey = config.apiKey;
  }

  // Generic API call method
  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const options = {
      method,
      headers,
      credentials: 'include' // Include cookies for session management
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('API Request Failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: true // Indicate that fallback data should be used
      };
    }
  }

  // 1. POST /api/request-otp
  async sendOTP(mobileNumber) {
    return await this.makeRequest('/api/request-otp', 'POST', {
      mobile_number: mobileNumber,
      timestamp: new Date().toISOString()
    });
  }

  // 2. POST /api/verify-otp
  async verifyOTP(mobileNumber, otp) {
    return await this.makeRequest('/api/verify-otp', 'POST', {
      mobile_number: mobileNumber,
      otp: otp,
      timestamp: new Date().toISOString()
    });
  }

  // 3. GET /api/user-details
  async getUserDetails(mobileNumber) {
    return await this.makeRequest(`/api/user-details?mobile=${mobileNumber}`, 'GET');
  }

  // 4. POST /api/complaints (to create a new complaint)
  async createComplaint(complaintData) {
    return await this.makeRequest('/api/complaints', 'POST', {
      ...complaintData,
      created_at: new Date().toISOString()
    });
  }

  // 5. GET /api/complaints/{complaint_id} (to fetch status)
  async getComplaintStatus(complaintId) {
    return await this.makeRequest(`/api/complaints/${complaintId}`, 'GET');
  }

  // 6. PUT /api/update-profile
  async updateProfile(profileData) {
    return await this.makeRequest('/api/update-profile', 'POST', {
      full_name: profileData.full_name,
      industrial_area: profileData.industrial_area,
      updated_at: new Date().toISOString()
    });
  }

  // Additional helper method for file upload
  async uploadFile(file, complaintId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('complaint_id', complaintId);
    formData.append('uploaded_at', new Date().toISOString());

    const url = `${this.baseURL}/api/upload-file`;
    const headers = {};
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('File Upload Failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }
}

