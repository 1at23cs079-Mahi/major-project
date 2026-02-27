# Emergency System Documentation

## Overview
Life-critical emergency and safety features for the Healthcare Management System.

## Features

### 1. Emergency Contacts
- CRUD operations for emergency contacts
- Primary contact designation
- Automatic notification routing

### 2. SOS System
**Endpoint:** `POST /api/emergency/sos`

**Workflow:**
1. Patient triggers SOS
2. System logs emergency with critical details (blood group, allergies, chronic conditions)
3. Notifies ALL emergency contacts via priority routing
4. Notifies nearby doctors (if location provided)
5. Creates high-priority notification in patient account

**Failover:**
- If notification fails, emergency is still logged
- Minimum viable response: Log emergency to database
- Fallback: Log to file system if database fails
- Last resort: Console log with full details

**No Rate Limiting:** SOS endpoints have no rate limits (life-critical)

### 3. Ambulance Request
**Endpoint:** `POST /api/emergency/ambulance`

**Workflow:**
1. Patient requests ambulance
2. Captures location, emergency type, patient critical info
3. Logs ambulance request with unique ID
4. Notifies primary emergency contact
5. Returns request ID for tracking

**Future Integration:**
- Connect to local ambulance dispatch API
- Real-time tracking
- ETA calculation

### 4. Health Card QR Code
**Endpoint:** `GET /api/health-card`

**Critical Information Included:**
- Patient name
- Blood group
- Allergies
- Chronic conditions
- Emergency contact (primary)
- Date of birth

**Use Cases:**
- Print physical card
- Display on phone lock screen
- Scan by emergency responders
- Offline access to critical info

**Scanning:** `POST /api/health-card/scan`
- Doctors/Admin can scan QR to access patient emergency info
- Automatically logs access for audit trail

### 5. Priority Notification Routing

**Priority Levels:**
- **Critical:** Cardiac, respiratory, trauma emergencies
  - Channels: SMS, Call, Push, Email
  - Retries: 5
  - Timeout: 30 seconds

- **High:** Severe medical emergencies
  - Channels: SMS, Push, Email
  - Retries: 3
  - Timeout: 1 minute

- **Normal:** Standard notifications
  - Channels: Push, Email
  - Retries: 2
  - Timeout: 2 minutes

### 6. Audit Trail

All emergency events are logged with:
- User ID
- Action (sos_triggered, ambulance_requested, etc.)
- Timestamp
- Location (if available)
- Patient critical info
- IP address
- Success/failure status

**Retention:** 7 years (HIPAA requirement)

### 7. Failover Mechanisms

**Level 1:** Database logging (primary)
**Level 2:** File system logging (if database fails)
**Level 3:** Console logging with full details (last resort)

**Emergency logs directory:** `backend/emergency_logs/`

## Security Considerations

- Emergency contacts can only be managed by patient
- Health card scanning is logged for audit
- SOS triggers are rate-limit exempt
- All emergency events create immutable audit logs

## Testing

### Test SOS:
```bash
curl -X POST http://localhost:5000/api/emergency/sos \
  -H "Authorization: Bearer <patient_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"latitude": 40.7128, "longitude": -74.0060},
    "emergency_type": "cardiac",
    "notes": "Chest pain, difficulty breathing"
  }'
```

### Test Health Card:
```bash
curl http://localhost:5000/api/health-card \
  -H "Authorization: Bearer <patient_token>"
```

## Future Enhancements

1. Integration with local emergency services
2. Real-time ambulance tracking
3. Geofencing for automatic doctor notification
4. Voice-activated SOS
5. Wearable device integration
6. Offline mode for health card access
