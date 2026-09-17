export interface StateDistrictMap {
  [state: string]: string[];
}

export const INDIAN_STATES_DISTRICTS: StateDistrictMap = {
  "Bihar": [
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Rohtas", "Samastipur", "Begusarai", "Nalanda"
  ],
  "Uttar Pradesh": [
    "Varanasi", "Lucknow", "Kanpur", "Prayagraj", "Gorakhpur", "Agra", "Meerut", "Noida", "Bareilly", "Aligarh"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Thane", "Amravati", "Nanded"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas", "Hooghly", "Siliguri", "Murshidabad", "Burdwan", "Malda", "Darjeeling"
  ],
  "Assam": [
    "Kamrup Metropolitan (Guwahati)", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Barpeta"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna", "Dewas"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"
  ],
  "Karnataka": [
    "Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere", "Ballari"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar"
  ],
  "Odisha": [
    "Khordha (Bhubaneswar)", "Cuttack", "Ganjam", "Sundargarh (Rourkela)", "Sambalpur", "Balasore", "Puri"
  ],
  "Delhi (NCT)": [
    "Central Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"
  ]
};

export const DEFAULT_STATE = "Uttar Pradesh";
export const DEFAULT_DISTRICT = "Varanasi";
