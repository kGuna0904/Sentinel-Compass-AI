
interface ContactInfo {
  name: string;
  role: string;
  phoneNumber: string;
  email: string;
}

interface EmergencyTeam {
  teamName: string;
  teamHead: ContactInfo;
  members: ContactInfo[];
}

export interface EmergencyConfig {
  evacuationTeam: EmergencyTeam;
  alertTeam: EmergencyTeam;
  resourcesTeam: EmergencyTeam;
  allClearTeam: EmergencyTeam;
  regionDevices: string[]; // Could be phone numbers or device IDs
}

// Default configuration - in a real app, this would come from a backend system
const defaultEmergencyConfig: EmergencyConfig = {
  evacuationTeam: {
    teamName: "Evacuation Response",
    teamHead: {
      name: "Sarah Johnson",
      role: "Evacuation Director",
      phoneNumber: "+1-555-123-4567",
      email: "sjohnson@emergency.org"
    },
    members: [
      {
        name: "Mike Roberts",
        role: "Field Coordinator",
        phoneNumber: "+1-555-234-5678",
        email: "mroberts@emergency.org"
      },
      {
        name: "Lisa Chen",
        role: "Transportation Lead",
        phoneNumber: "+1-555-345-6789",
        email: "lchen@emergency.org"
      }
    ]
  },
  alertTeam: {
    teamName: "Public Alert System",
    teamHead: {
      name: "David Williams",
      role: "Alert System Director",
      phoneNumber: "+1-555-456-7890",
      email: "dwilliams@emergency.org"
    },
    members: [
      {
        name: "Carlos Rodriguez",
        role: "Communications Specialist",
        phoneNumber: "+1-555-567-8901",
        email: "crodriguez@emergency.org"
      },
      {
        name: "Aisha Patel",
        role: "Media Relations",
        phoneNumber: "+1-555-678-9012",
        email: "apatel@emergency.org"
      }
    ]
  },
  resourcesTeam: {
    teamName: "Resource Management",
    teamHead: {
      name: "Robert Kim",
      role: "Resource Director",
      phoneNumber: "+1-555-789-0123",
      email: "rkim@emergency.org"
    },
    members: [
      {
        name: "Jane Martinez",
        role: "Supply Chain Manager",
        phoneNumber: "+1-555-890-1234",
        email: "jmartinez@emergency.org"
      },
      {
        name: "Sam Taylor",
        role: "Equipment Coordinator",
        phoneNumber: "+1-555-901-2345",
        email: "staylor@emergency.org"
      }
    ]
  },
  allClearTeam: {
    teamName: "All Clear Operations",
    teamHead: {
      name: "Emma Wilson",
      role: "Operations Director",
      phoneNumber: "+1-555-012-3456",
      email: "ewilson@emergency.org"
    },
    members: [
      {
        name: "Thomas Brown",
        role: "Safety Inspector",
        phoneNumber: "+1-555-123-4567",
        email: "tbrown@emergency.org"
      },
      {
        name: "Nina Garcia",
        role: "Community Liaison",
        phoneNumber: "+1-555-234-5678",
        email: "ngarcia@emergency.org"
      }
    ]
  },
  regionDevices: [
    "+1-555-111-2222", // Represents a mobile device in the region
    "+1-555-333-4444", // Represents another device
    "laptop-id-12345"  // Represents a connected laptop
  ]
};

// In a real application, these functions would make API calls to external services
// for sending SMS, push notifications, or emails
export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

export const sendEmail = async (email: string, subject: string, message: string): Promise<boolean> => {
  console.log(`Email would be sent to ${email}: ${subject} - ${message}`);
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

export const sendPushNotification = async (deviceId: string, title: string, message: string): Promise<boolean> => {
  console.log(`Push notification would be sent to ${deviceId}: ${title} - ${message}`);
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

// Main functions for different emergency actions
export const initiateEvacuation = async (regionName: string, config = defaultEmergencyConfig): Promise<boolean> => {
  const message = `URGENT: Evacuation required in ${regionName}. Implement evacuation protocol immediately.`;
  const emailSubject = `URGENT EVACUATION: ${regionName}`;
  
  try {
    // Notify team head
    await sendSMS(config.evacuationTeam.teamHead.phoneNumber, message);
    await sendEmail(config.evacuationTeam.teamHead.email, emailSubject, message);
    
    // Notify team members
    for (const member of config.evacuationTeam.members) {
      await sendSMS(member.phoneNumber, message);
      await sendEmail(member.email, emailSubject, message);
    }
    
    console.log("Evacuation notification completed");
    return true;
  } catch (error) {
    console.error("Failed to send evacuation notifications:", error);
    return false;
  }
};

export const sendRegionAlert = async (regionName: string, alertMessage: string, config = defaultEmergencyConfig): Promise<boolean> => {
  const message = `ALERT: ${alertMessage} in ${regionName}. Take appropriate action immediately.`;
  const emailSubject = `REGION ALERT: ${regionName}`;
  
  try {
    // Notify alert team
    await sendSMS(config.alertTeam.teamHead.phoneNumber, message);
    await sendEmail(config.alertTeam.teamHead.email, emailSubject, message);
    
    for (const member of config.alertTeam.members) {
      await sendSMS(member.phoneNumber, message);
      await sendEmail(member.email, emailSubject, message);
    }
    
    // Send to all regional devices
    for (const device of config.regionDevices) {
      if (device.startsWith("+")) {
        await sendSMS(device, message);
      } else {
        await sendPushNotification(device, "EMERGENCY ALERT", message);
      }
    }
    
    console.log("Region alert notification completed");
    return true;
  } catch (error) {
    console.error("Failed to send region alerts:", error);
    return false;
  }
};

export const requestEmergencyResources = async (regionName: string, resourcesNeeded: string[], config = defaultEmergencyConfig): Promise<boolean> => {
  const resourceList = resourcesNeeded.join(", ");
  const message = `RESOURCE REQUEST: The following resources are needed in ${regionName}: ${resourceList}`;
  const emailSubject = `RESOURCE REQUEST: ${regionName}`;
  
  try {
    // Notify resources team
    await sendSMS(config.resourcesTeam.teamHead.phoneNumber, message);
    await sendEmail(config.resourcesTeam.teamHead.email, emailSubject, message);
    
    for (const member of config.resourcesTeam.members) {
      await sendSMS(member.phoneNumber, message);
      await sendEmail(member.email, emailSubject, message);
    }
    
    console.log("Resource request notification completed");
    return true;
  } catch (error) {
    console.error("Failed to send resource requests:", error);
    return false;
  }
};

export const signalAllClear = async (regionName: string, config = defaultEmergencyConfig): Promise<boolean> => {
  const message = `ALL CLEAR: The emergency situation in ${regionName} has been resolved. You may return to normal operations.`;
  const emailSubject = `ALL CLEAR: ${regionName}`;
  
  try {
    // Notify all clear team
    await sendSMS(config.allClearTeam.teamHead.phoneNumber, message);
    await sendEmail(config.allClearTeam.teamHead.email, emailSubject, message);
    
    for (const member of config.allClearTeam.members) {
      await sendSMS(member.phoneNumber, message);
      await sendEmail(member.email, emailSubject, message);
    }
    
    // Send to all regional devices
    for (const device of config.regionDevices) {
      if (device.startsWith("+")) {
        await sendSMS(device, message);
      } else {
        await sendPushNotification(device, "ALL CLEAR", message);
      }
    }
    
    console.log("All clear notification completed");
    return true;
  } catch (error) {
    console.error("Failed to send all clear notifications:", error);
    return false;
  }
};
