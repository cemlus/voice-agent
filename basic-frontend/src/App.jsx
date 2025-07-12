import React, { useState, useEffect } from 'react';
import './App.css';

import axios from 'axios';

export default function App() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'instant',
    enhance: false,
    gender: '',
    description: '',
    files: []
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/lmnt/voices');
      console.log(res.data);
      
      setVoices(res.data);
    } catch (err) {
      console.error('Error fetching voices', err);
    }
  };

  const fetchVoiceDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/lmnt/voices/${id}`);
      setSelectedVoice(res.data);
    } catch (err) {
      console.error('Error fetching voice details', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, files: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('metadata', JSON.stringify({
      name: formData.name,
      type: formData.type,
      enhance: formData.enhance,
      gender: formData.gender,
      description: formData.description
    }));
    formData.files.forEach(file => payload.append('audioFiles', file));

    setCreating(true);
    try {
      const res = await axios.post('http://localhost:8080/api/lmnt/voices', payload);
      setCreating(false);
      fetchVoices();
      setSelectedVoice(res.data.voiceData);
    } catch (err) {
      console.error('Creation error', err);
      setCreating(false);
    }
  };

  console.log(selectedVoice);
  

  return (
    <div className="p-8 w-[90vw] m-auto">
      <h1 className="text-2xl font-bold mb-4">Voice Bot Agent Manager</h1>
      <section className="mb-8 p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Create Agent Voice</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" required />
          </div>
          <div className="flex space-x-4">
            <label>
              <input type="checkbox" name="enhance" checked={formData.enhance} onChange={handleInputChange} /> Enhance
            </label>
            <label>
              Type:
              <select name="type" value={formData.type} onChange={handleInputChange} className="ml-2 p-1 border rounded">
                <option value="instant">Instant</option>
                <option value="professional">Professional</option>
              </select>
            </label>
          </div>
          <div>
            <label className="block mb-1">Gender</label>
            <input name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border rounded" />
          </div>
          <div className='flex flex-col'>
            <label className=" w-fit text-violet-950 bg-amber-300 m-2 p-4 rounded-md mb-1">Upload Voice Samples ⬇️</label>
            <input type="file" multiple accept="audio/*" onChange={handleFileChange} />
          </div>
          <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {creating ? 'Creating...' : 'Create Voice'}
          </button>
        </form>
      </section>

    <div className='flex flex-row justify-between'>
      <section className="mb-8 max-w-[40vw] ">
        <h2 className="text-xl font-semibold mb-2">Available Voices</h2>
        <ul className="flex flex-wrap gap-4 ">
          {voices.map(v => (
            <li key={v.id}>
              <button onClick={() => fetchVoiceDetails(v.id)} className="text-blue-500 hover:underline">
                {v.name} ({v.state})
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selectedVoice && (
        <section className="p-4 border rounded-lg shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-2">Voice Details</h2>
        
          <p><strong>ID:</strong> {selectedVoice.id}</p>
          <p><strong>Name:</strong> {selectedVoice.name}</p>
          <p><strong>Owner:</strong> {selectedVoice.owner}</p>
          <p><strong>State:</strong> {selectedVoice.state}</p>
          <p><strong>Type:</strong> {selectedVoice.type}</p>
          <p><strong>Gender:</strong> {selectedVoice.gender}</p>
          <p><strong>Description:</strong> {selectedVoice.description}</p>
          {selectedVoice.preview_url && (
            <audio controls src={selectedVoice.preview_url} className="mt-2" />
          )}
        </section>
      )}

    </div>
    </div>
  );
}
