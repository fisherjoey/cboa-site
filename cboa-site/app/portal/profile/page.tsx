'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    certificationLevel: user?.certificationLevel || '',
    address: '',
    city: 'Calgary',
    province: 'AB',
    postalCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    preferredPositions: [] as string[],
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: true,
      sunday: true,
    },
    travelDistance: '25',
    bio: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save profile data
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.startsWith('availability.')) {
        const day = name.split('.')[1];
        setProfileData(prev => ({
          ...prev,
          availability: {
            ...prev.availability,
            [day]: checkbox.checked
          }
        }));
      } else if (name === 'preferredPositions') {
        const position = value;
        setProfileData(prev => ({
          ...prev,
          preferredPositions: checkbox.checked 
            ? [...prev.preferredPositions, position]
            : prev.preferredPositions.filter(p => p !== position)
        }));
      }
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">Manage your personal information and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.fullName || 'Official'}</h2>
                <p className="text-gray-500">Member since {user?.memberSince ? new Date(user.memberSince).getFullYear() : '2024'}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {user?.certificationLevel || 'Level 1'}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={profileData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="certificationLevel" className="block text-sm font-medium text-gray-700">
                    Certification Level
                  </label>
                  <select
                    name="certificationLevel"
                    id="certificationLevel"
                    value={profileData.certificationLevel}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  >
                    <option value="">Select Level</option>
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                    <option value="Level 4">Level 4</option>
                    <option value="Level 5">Level 5</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={profileData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={profileData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    id="postalCode"
                    value={profileData.postalCode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    id="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    id="emergencyPhone"
                    value={profileData.emergencyPhone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Officiating Preferences */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Officiating Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Positions
                  </label>
                  <div className="space-y-2">
                    {['Lead', 'Trail', 'Center', 'No Preference'].map(position => (
                      <label key={position} className="flex items-center">
                        <input
                          type="checkbox"
                          name="preferredPositions"
                          value={position}
                          checked={profileData.preferredPositions.includes(position)}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{position}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="travelDistance" className="block text-sm font-medium text-gray-700">
                    Maximum Travel Distance (km)
                  </label>
                  <select
                    name="travelDistance"
                    id="travelDistance"
                    value={profileData.travelDistance}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  >
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                    <option value="100">100 km</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weekly Availability
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(profileData.availability).map(([day, available]) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`availability.${day}`}
                          checked={available}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio / Additional Notes
                  </label>
                  <textarea
                    name="bio"
                    id="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="Tell us about your officiating experience, goals, or any special considerations..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Account Actions */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
          <div className="space-y-4">
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Change Password
            </button>
            <br />
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Download My Data
            </button>
            <br />
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}