import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { EnhancedInput } from '@/components/ui/enhanced-components';

interface LocationInfoSectionProps {
  formData: Record<string, string>;
  handleInputChange: (fieldName: string, value: any) => void;
  validateField: (fieldName: string, fieldValue: string) => void;
}

const LocationInfoSection: React.FC<LocationInfoSectionProps> = ({
  formData,
  handleInputChange,
  validateField,
}) => {
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep',
  ];

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata',
    'Surat', 'Pune', 'Jaipur City', 'North India (Location to be finalised)', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
    'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
    'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli',
    'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar',
    'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur', 'Coimbatore',
    'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati',
    'Solapur', 'Hubli-Dharwad', 'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon',
    'Aligarh', 'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Warangal',
    'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida',
    'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar',
    'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur', 'Ajmer',
    'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi',
    'Ulhasnagar', 'Jammu', 'Sangli-Miraj', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur',
    'Tirunelveli', 'Malegaon', 'Gaya', 'Tiruppur', 'Davanagere', 'Kozhikode',
    'Akbarpur', 'Kurnool', 'Rajpur Sonarpur', 'Bokaro', 'South Dumdum', 'Bellary',
    'Patiala', 'Gopalpur', 'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Bhatpara',
    'Panihati', 'Latur', 'Dhule', 'Tirupati', 'Rohtak', 'Korba', 'Bhilwara',
    'Berhampur', 'Muzaffarpur', 'Ahmednagar', 'Mathura', 'Kollam', 'Avadi',
    'Kadapa', 'Kamarhati', 'Bilaspur', 'Shahjahanpur', 'Bijapur', 'Rampur',
    'Shivamogga', 'Chandrapur', 'Junagadh', 'Thrissur', 'Alwar', 'Bardhaman',
    'Kulti', 'Kakinada', 'Nizamabad', 'Parbhani', 'Tumkur', 'Khammam', 'Ozhukarai',
    'Bihar Sharif', 'Panipat', 'Darbhanga', 'Bally', 'Aizawl', 'Dewas', 'Ichalkaranji',
    'Karnal', 'Bathinda', 'Jalna', 'Eluru', 'Kirari Suleman Nagar', 'Barasat',
    'Purnia', 'Satna', 'Mau', 'Sonipat', 'Farrukhabad', 'Sagar', 'Durg', 'Imphal',
    'Ratlam', 'Hapur', 'Arrah', 'Karimnagar', 'Anantapur', 'Etawah', 'Ambarnath',
    'North Dumdum', 'Bharatpur', 'Begusarai', 'New Delhi', 'Gandhidham', 'Baranagar',
    'Tiruvottiyur', 'Pondicherry', 'Sikar', 'Thoothukudi', 'Rewa', 'Mirzapur',
    'Raichur', 'Pali', 'Ramagundam', 'Silchar', 'Haridwar', 'Vijayanagaram', 'Tenali',
    'Nagercoil', 'Sri Ganganagar', 'Karawal Nagar', 'Mango', 'Thanjavur', 'Bulandshahr',
    'Uluberia', 'Katni', 'Sambhal', 'Singrauli', 'Nadiad', 'Secunderabad', 'Naihati',
    'Yamunanagar', 'Bidhan Nagar', 'Pallavaram', 'Bidar', 'Munger', 'Panchkula',
    'Burhanpur', 'Raurkela Industrial Township', 'Kharagpur', 'Dindigul', 'Gandhinagar',
    'Hospet', 'Nangloi Jat', 'Malda', 'Ongole', 'Deoghar', 'Chapra', 'Haldia',
    'Khandwa', 'Nandyal', 'Morena', 'Amroha', 'Anand', 'Bhind', 'Bhalswa Jahangir Pur',
    'Madhyamgram', 'Bhiwani', 'Berhampore', 'Ambala', 'Morbi', 'Fatehpur', 'Raebareli',
    'Khora', 'Orai', 'Bahraich', 'Phusro', 'Vellore', 'Mehsana', 'Raiganj', 'Sirsa',
    'Danapur', 'Serampore', 'Sultan Pur Majra', 'Guna', 'Jaunpur', 'Panvel',
    'Shivpuri', 'Surendranagar Dudhrej', 'Unnao', 'Chinsurah', 'Alappuzha',
    'Kottayam', 'Machilipatnam', 'Shimla', 'Adoni', 'Udupi', 'Katihar', 'Proddatur',
    'Mahbubnagar', 'Saharsa', 'Dibrugarh', 'Jorhat', 'Hazaribagh', 'Hindupur',
    'Nagaon', 'Sasaram', 'Hajipur', 'Giridih', 'Bhimavaram', 'Kumbakonam', 'Rajahmundry',
  ];

  return (
    <div className="bg-linear-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200/50">
      <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-purple-600" />
        Location & Preferences
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {/* State Selection */}
        <div className="space-y-2">
          <Label htmlFor="state" className="text-purple-700 font-semibold text-sm">
            State
          </Label>
          <Select value={formData.state || ''} onValueChange={(value) => handleInputChange('state', value)}>
            <SelectTrigger className="h-10 text-sm border-purple-300 focus:border-purple-500">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              {indianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selection */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-purple-700 font-semibold text-sm">
            City
          </Label>
          <Select value={formData.city || ''} onValueChange={(value) => handleInputChange('city', value)}>
            <SelectTrigger className="h-10 text-sm border-purple-300 focus:border-purple-500">
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Player Type */}
        <div className="space-y-2">
          <Label htmlFor="position" className="text-purple-700 font-semibold text-sm">
            Player Type
          </Label>
          <Select value={formData.position || ''} onValueChange={(value) => handleInputChange('position', value)}>
            <SelectTrigger className="h-10 text-sm border-purple-300 focus:border-purple-500">
              <SelectValue placeholder="Select your playing position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Batting">Batting</SelectItem>
              <SelectItem value="Bowling">Bowling</SelectItem>
              <SelectItem value="All-Rounder">All-Rounder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PIN Code */}
        <div className="space-y-2">
          <Label htmlFor="pincode" className="text-purple-700 font-semibold text-sm">
            PIN Code
          </Label>
          <EnhancedInput
            id="pincode"
            type="text"
            placeholder="Enter your PIN code"
            value={formData.pincode || ''}
            onChange={(e) => {
              const inputValue = e.target.value.replace(/\D/g, ''); // Only allow digits
              if (inputValue.length <= 6) {
                handleInputChange('pincode', inputValue);
                validateField('pincode', inputValue);
              }
            }}
            error={formData.pincode_error || ''}
            success={formData.pincode_success || ''}
            required={false}
            leftIcon={<MapPin className="w-3 h-3" />}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationInfoSection;