# n8n Setup Guide for Job Application Automation

## 📋 Table of Contents
1. [Install n8n](#install-n8n)
2. [Create Google Sheet Database](#create-google-sheet-database)
3. [Build n8n Workflows](#build-n8n-workflows)
4. [Connect Frontend to n8n](#connect-frontend-to-n8n)

---

## 1. Install n8n

### Step 1: Install n8n globally
```bash
npm install -g n8n
```

### Step 2: Start n8n
```bash
n8n start
```

This will open n8n at `http://localhost:5678`

---

## 2. Create Google Sheet Database

### Step 1: Create a new Google Sheet
Go to https://sheets.google.com and create a new spreadsheet called "Job Applications"

### Step 2: Create these sheets (tabs):

**Sheet 1: Applications**
| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|----------|----------|----------|----------|----------|----------|
| Job Title | Company | Location | Status | Applied Date | Job URL | Campaign |

**Sheet 2: Campaigns**
| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| Campaign Name | Job Title | Platforms | Status | Applied | Responses | Interviews |

**Sheet 3: Stats**
| Column A | Column B |
|----------|----------|
| Total Applications | 0 |
| Active Campaigns | 0 |
| Response Rate | 0 |
| Interviews | 0 |

### Step 3: Connect Google Sheets to n8n
1. In n8n, go to **Credentials** → **Add Credential**
2. Select **Google Sheets OAuth2 API**
3. Follow the authorization flow

---

## 3. Build n8n Workflows

Here are the 6 workflows you need to create:

### Workflow 1: Get Stats
**Purpose:** Return dashboard statistics

**Nodes:**
1. **Webhook** (Trigger)
   - Method: GET
   - Path: `get-stats`

2. **Google Sheets** (Read)
   - Operation: Read
   - Sheet: Stats
   - Range: A1:B5

3. **Code** (Format response)
   ```javascript
   const items = $input.all();
   const stats = {};
   
   items.forEach(item => {
     const key = item.json['A'];
     const value = item.json['B'];
     
     if (key === 'Total Applications') stats.totalApplications = value;
     if (key === 'Active Campaigns') stats.activeCampaigns = value;
     if (key === 'Response Rate') stats.responseRate = value;
     if (key === 'Interviews') stats.interviews = value;
   });
   
   return [{ json: stats }];
   ```

4. **Respond to Webhook**

---

### Workflow 2: Get Applications
**Purpose:** Return list of applications

**Nodes:**
1. **Webhook** (Trigger)
   - Method: GET
   - Path: `get-applications`

2. **Google Sheets** (Read)
   - Operation: Read
   - Sheet: Applications
   - Range: A2:G100 (skip header row)

3. **Code** (Format response)
   ```javascript
   const items = $input.all();
   const applications = [];
   
   items.forEach(item => {
     if (item.json['A']) { // Only if row has data
       applications.push({
         jobTitle: item.json['A'],
         company: item.json['B'],
         location: item.json['C'],
         status: item.json['D'],
         appliedDate: item.json['E'],
         jobUrl: item.json['F'],
         campaign: item.json['G']
       });
     }
   });
   
   // Return most recent 10
   return [{ json: applications.slice(0, 10) }];
   ```

4. **Respond to Webhook**

---

### Workflow 3: Get Campaigns
**Purpose:** Return list of campaigns

**Nodes:**
1. **Webhook** (Trigger)
   - Method: GET
   - Path: `get-campaigns`

2. **Google Sheets** (Read)
   - Operation: Read
   - Sheet: Campaigns
   - Range: A2:G100

3. **Code** (Format response)
   ```javascript
   const items = $input.all();
   const campaigns = [];
   
   items.forEach(item => {
     if (item.json['A']) {
       campaigns.push({
         name: item.json['A'],
         jobTitle: item.json['B'],
         platforms: item.json['C'],
         status: item.json['D'],
         applied: parseInt(item.json['E']) || 0,
         responses: parseInt(item.json['F']) || 0,
         interviews: parseInt(item.json['G']) || 0,
         progress: Math.floor(Math.random() * 100) // Calculate real progress later
       });
     }
   });
   
   return [{ json: campaigns }];
   ```

4. **Respond to Webhook**

---

### Workflow 4: Create Campaign
**Purpose:** Create a new campaign

**Nodes:**
1. **Webhook** (Trigger)
   - Method: POST
   - Path: `create-campaign`

2. **Google Sheets** (Append)
   - Operation: Append
   - Sheet: Campaigns
   - Columns:
     - A: `{{ $json.campaignName }}`
     - B: `{{ $json.jobTitle }}`
     - C: `{{ $json.platforms.join(',') }}`
     - D: active
     - E: 0
     - F: 0
     - G: 0

3. **Code** (Update stats)
   ```javascript
   // Increment active campaigns count
   return [{ 
     json: { 
       success: true, 
       message: 'Campaign created successfully' 
     } 
   }];
   ```

4. **Respond to Webhook**

---

### Workflow 5: Upload Resume
**Purpose:** Store resume (you can save to Google Drive later)

**Nodes:**
1. **Webhook** (Trigger)
   - Method: POST
   - Path: `upload-resume`

2. **Code** (Process file)
   ```javascript
   const { filename, fileData, fileType } = $json;
   
   // For now, just acknowledge upload
   // Later: save to Google Drive or AWS S3
   
   return [{ 
     json: { 
       success: true, 
       message: 'Resume uploaded',
       filename: filename
     } 
   }];
   ```

3. **Respond to Webhook**

---

### Workflow 6: Find Jobs
**Purpose:** Search for jobs (placeholder for now)

**Nodes:**
1. **Webhook** (Trigger)
   - Method: POST
   - Path: `find-jobs`

2. **Code** (Search logic)
   ```javascript
   const { jobTitle, location, platforms } = $json;
   
   // This is where you'd scrape job boards
   // For now, return dummy data
   
   return [{ 
     json: { 
       success: true, 
       count: 42,
       message: `Found jobs for ${jobTitle} in ${location}`
     } 
   }];
   ```

3. **Respond to Webhook**

---

## 4. Connect Frontend to n8n

### Step 1: Get your webhook URLs
After creating each workflow in n8n, click on the Webhook node to see its URL.
It will look like: `http://localhost:5678/webhook/get-stats`

### Step 2: Update app.js
In the `app.js` file, update the `CONFIG.webhooks` object with your actual URLs:

```javascript
const CONFIG = {
    webhooks: {
        createCampaign: 'http://localhost:5678/webhook/create-campaign',
        getApplications: 'http://localhost:5678/webhook/get-applications',
        getCampaigns: 'http://localhost:5678/webhook/get-campaigns',
        getStats: 'http://localhost:5678/webhook/get-stats',
        uploadResume: 'http://localhost:5678/webhook/upload-resume',
        findJobs: 'http://localhost:5678/webhook/find-jobs'
    }
};
```

### Step 3: Test it!
1. Open `job-automation-ui.html` in your browser
2. Click the buttons
3. Check the browser console (F12) for logs
4. Check your Google Sheet for new data

---

## 🎯 Next Steps

Once this is working, you can:

1. **Add real job scraping** - Use HTTP Request nodes to scrape Greenhouse, LinkedIn, etc.
2. **Automate applications** - Build workflows that fill out forms automatically
3. **Add scheduling** - Use Cron nodes to run campaigns automatically
4. **Add email notifications** - Get notified when you get responses
5. **Build a settings page** - Let users configure their preferences

---

## 🐛 Troubleshooting

**Problem: "Failed to load..."**
- Make sure n8n is running (`n8n start`)
- Check webhook URLs are correct
- Look at browser console (F12) for errors

**Problem: CORS error**
- n8n should handle CORS by default
- If not, you may need to add CORS headers in n8n workflow

**Problem: Data not showing**
- Check Google Sheets has data
- Check workflow is active (toggle in n8n)
- Check webhook URL is correct

---

## 📚 Resources

- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- Google Sheets API: https://developers.google.com/sheets/api

---

Good luck! 🚀
