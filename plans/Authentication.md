# Authentication System Plan (Revised)

## Overview
This document outlines a revised plan for an authentication system. Instead of IP-based access, this system will grant "admin" privileges to a user's session upon a specific client-side interaction (pressing 'L' five times within 10 seconds). These admin privileges will allow access to specific backend API routes. The admin role will be revoked when session data is cleared (e.g., on logout). All admin routes will be accessible directly via API, without a dedicated web UI.

## Components and Steps

### 1. Frontend: Implement 'L' Button Press Detection (JavaScript)

This step involves adding JavaScript to the frontend of your application to detect the specific key presses.

*   **Listen for 'L' key presses**: Attach an event listener for `keydown` events.
*   **Track consecutive presses**: Maintain a count of 'L' presses.
*   **Implement a time window**: Use a timer to ensure 5 presses occur within 10 seconds. Reset the count if the time window expires or if a different key is pressed.
*   **Trigger API call**: If 5 'L' presses are detected within 10 seconds, make an AJAX request (e.g., using `fetch` or `XMLHttpRequest`) to a new backend endpoint (e.g., `/api/grant-admin`).

```javascript
// public/js/admin_unlock.js
let lPressCount = 0;
let lastPressTime = 0;
const TIME_WINDOW = 10000; // 10 seconds

document.addEventListener('keydown', (event) => {
    if (event.key === 'l' || event.key === 'L') {
        const currentTime = Date.now();

        if (currentTime - lastPressTime < TIME_WINDOW) {
            lPressCount++;
        } else {
            // Reset if outside time window
            lPressCount = 1;
        }
        lastPressTime = currentTime;

        if (lPressCount >= 5) {
            console.log("Admin unlock sequence detected!");
            fetch('/api/grant-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Admin session activated!');
                    // Optionally, redirect or update UI
                } else {
                    alert('Failed to activate admin session: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error granting admin:', error);
                alert('An error occurred while activating admin session.');
            });

            // Reset count immediately after successful activation or attempt
            lPressCount = 0;
            lastPressTime = 0;
        }
    } else {
        // Reset count if any other key is pressed
        lPressCount = 0;
        lastPressTime = 0;
    }
});
```
*Note: This JavaScript needs to be included in the relevant HTML pages.*

### 2. Backend: Create an Endpoint to Grant Admin Privileges (Flask)

This endpoint will be responsible for modifying the current user's session to mark them as an "admin."

*   **Define `/api/grant-admin` route**: This route should accept `POST` requests.
*   **Update session data**: Upon receiving a request, set a flag in the Flask session (e.g., `session['is_admin'] = True`).
*   **Return status**: Respond with a JSON object indicating success or failure.

```python
# src/main.py
from flask import Flask, session, jsonify, request
# Import any other necessary Flask extensions like Flask-Session or modify directly

app = Flask(__name__)
app.secret_key = 'your_very_secret_key_here' # IMPORTANT: Change this to a strong, random key in production

@app.route('/api/grant-admin', methods=['POST'])
def grant_admin_privileges():
    session['is_admin'] = True
    return jsonify({'status': 'success', 'message': 'Admin privileges granted for this session'})
```

### 3. Backend: Implement a Decorator for Admin-Only Routes (Flask)

This decorator will protect your admin routes by checking the `is_admin` flag in the session.

*   **Define `admin_required` decorator**: This function will wrap other view functions.
*   **Check `session['is_admin']`**: Inside the decorator, verify if `session.get('is_admin')` is `True`.
*   **Deny access if not admin**: If `is_admin` is not `True`, return a 403 Forbidden JSON response.
*   **Allow access if admin**: If `is_admin` is `True`, proceed with the original view function.

```python
# src/main.py
# ... existing imports ...
from functools import wraps

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function
```

### 4. Backend: Define Admin API Routes (Flask)

Create your admin-specific API routes and apply the `admin_required` decorator to protect them.

*   **Create example admin routes**: Define routes like `/api/admin/dashboard` or `/api/admin/content`.
*   **Apply `admin_required`**: Use `@admin_required` above the route decorator.
*   **Return JSON**: Ensure these routes return JSON responses, as they are API-only.

```python
# src/main.py
# ... existing code ...

@app.route('/api/admin/dashboard', methods=['GET'])
@admin_required
def admin_dashboard():
    # Example admin logic
    return jsonify({'status': 'success', 'data': 'Welcome to the admin dashboard!'})

@app.route('/api/admin/content', methods=['POST'])
@admin_required
def admin_upload_content():
    # Your content upload/management logic here
    data = request.json
    if data:
        return jsonify({'status': 'success', 'message': f'Content "{data.get("title", "unknown")}" updated by admin.'})
    return jsonify({'status': 'error', 'message': 'Invalid content data'}), 400
```

### 5. Session Management and Google Integration

The admin role is tied to the Flask session.

*   **Session Clearing**: When a user's session is cleared (e.g., upon logout, session timeout, or browser closing, depending on session configuration), the `session['is_admin']` flag will be removed, effectively revoking admin privileges.
*   **Google Integration**: If your application uses Google for authentication, a Google logout process that also clears the Flask session (which is standard practice for web applications) will automatically disable the admin role for that session. Ensure your Google logout mechanism invalidates the server-side session.

```python
# src/main.py
# ... existing code ...

@app.route('/logout', methods=['POST']) # Example logout route
def logout():
    session.clear() # Clears all session data, including 'is_admin'
    return jsonify({'status': 'success', 'message': 'Logged out and session cleared.'})
```

### 6. API-Only Access for Admin Routes

Ensure that admin routes are designed purely as API endpoints.

*   **No UI Rendering**: These routes should always return JSON data, not render HTML templates.
*   **Frontend Interaction**: Any interaction with these admin routes should come from client-side JavaScript, not direct navigation in the browser for UI purposes.

## Final Implementation Plan

To implement these changes:

1.  **Switch to Agent Mode**: Request access to write tools.
2.  **Update `plans/Authentication.md`**: Replace its content with this revised plan.
3.  **Create/Update `src/main.py`**:
    *   Set `app.secret_key` (critically important for session security).
    *   Add the `admin_required` decorator definition.
    *   Add the `/api/grant-admin` route.
    *   Add your specific admin API routes (e.g., `/api/admin/dashboard`, `/api/admin/content`) and apply `@admin_required`.
    *   Ensure any existing routes are compatible or updated as needed.
    *   (Optional but recommended) Add a `/logout` route that clears the session.
4.  **Create Frontend JavaScript**:
    *   Create a `public/js/admin_unlock.js` file with the provided JavaScript code.
    *   Ensure this JavaScript file is loaded in your HTML templates where you want this feature to be active (e.g., `<script src="/static/js/admin_unlock.js"></script>`).
5.  **Testing**:
    *   Run the Flask application.
    *   From a browser, repeatedly press 'L' 5 times within 10 seconds. Observe the "Admin session activated!" alert.
    *   Attempt to access an admin API route (e.g., `/api/admin/dashboard`) using `fetch` or `curl`. Verify it works after activation.
    *   Clear your browser's session data or trigger the `/logout` route. Attempt to access the admin API route again. Verify it now denies access (403 Forbidden).