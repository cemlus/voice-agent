// import React, { useState, useEffect } from 'react';
// import './App.css';

// import axios from 'axios';

// function Spinner() {
//   return (
//     <div className="inline-flex items-center">
//       <svg className="animate-spin h-5 w-5 mr-2 border-2 border-t-2 rounded-full" viewBox="0 0 24 24" />
//       <span>Loading...</span>
//     </div>
//   );
// }

// function LongShot() {
//   const [voices, setVoices] = useState([]);
//   const [selectedVoice, setSelectedVoice] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     type: 'instant',
//     enhance: false,
//     gender: '',
//     description: '',
//     files: []
//   });
//   const [creating, setCreating] = useState(false);
//   const [updating, setUpdating] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const [editMode, setEditMode] = useState(false);

//   useEffect(() => {
//     fetchVoices();
//   }, []);

//   const fetchVoices = async () => {
//     try {
//       const res = await axios.get('http://localhost:8080/api/lmnt/voices');
//       setVoices(res.data);
//     } catch (err) {
//       console.error('Error fetching voices', err);
//     }
//   };

//   const fetchVoiceDetails = async (id) => {
//     try {
//       const res = await axios.get(`http://localhost:8080/api/lmnt/voices/${id}`);
//       setSelectedVoice(res.data);
//       setFormData({
//         name: res.data.name,
//         type: res.data.type,
//         enhance: res.data.enhance,
//         gender: res.data.gender,
//         description: res.data.description,
//         files: []
//       });
//       setEditMode(false);
//     } catch (err) {
//       console.error('Error fetching voice details', err);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleFileChange = (e) => {
//     setFormData(prev => ({ ...prev, files: Array.from(e.target.files) }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payload = new FormData();
//     payload.append('metadata', JSON.stringify({
//       name: formData.name,
//       type: formData.type,
//       enhance: formData.enhance,
//       gender: formData.gender,
//       description: formData.description
//     }));
//     formData.files.forEach(file => payload.append('audioFiles', file));

//     setCreating(true);
//     try {
//       const res = await axios.post('http://localhost:8080/api/lmnt/voices', payload);
//       fetchVoices();
//       setSelectedVoice(res.data.voiceData);
//     } catch (err) {
//       console.error('Creation error', err);
//     } finally {
//       setCreating(false);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!selectedVoice) return;
//     setUpdating(true);
//     try {
//       const metadata = {
//         name: formData.name,
//         type: formData.type,
//         enhance: formData.enhance,
//         gender: formData.gender,
//         description: formData.description
//       };
//       await axios.put(`http://localhost:8080/api/lmnt/voices/${selectedVoice.id}`, metadata);
//       fetchVoiceDetails(selectedVoice.id);
//       fetchVoices();
//       setEditMode(false);
//     } catch (err) {
//       console.error('Update error', err);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this voice?')) return;
//     setDeletingId(id);
//     try {
//       await axios.delete(`http://localhost:8080/api/lmnt/voices/${id}`);
//       setSelectedVoice(prev => (prev?.id === id ? null : prev));
//       fetchVoices();
//     } catch (err) {
//       console.error('Delete error', err);
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <div className="p-8 w-[90vw] m-auto">
//       <h1 className="text-2xl font-bold mb-4">Voice Bot Agent Manager</h1>
//       <section className="mb-8 p-4 border rounded-lg shadow-sm">
//         <h2 className="text-xl font-semibold mb-2">Create Agent Voice</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block mb-1">Name</label>
//             <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" required />
//           </div>
//           <div className="flex space-x-4">
//             <label>
//               <input type="checkbox" name="enhance" checked={formData.enhance} onChange={handleInputChange} /> Enhance
//             </label>
//             <label>
//               Type:
//               <select name="type" value={formData.type} onChange={handleInputChange} className="ml-2 p-1 border rounded">
//                 <option value="instant">Instant</option>
//                 <option value="professional">Professional</option>
//               </select>
//             </label>
//           </div>
//           <div>
//             <label className="block mb-1">Gender</label>
//             <input name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2 border rounded" />
//           </div>
//           <div>
//             <label className="block mb-1">Description</label>
//             <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border rounded" />
//           </div>
//           <div className='flex flex-col'>
//             <label className=" w-fit text-violet-950 bg-amber-300 m-2 p-4 rounded-md mb-1">Upload Voice Samples ⬇️</label>
//             <input type="file" multiple accept="audio/*" onChange={handleFileChange} />
//           </div>
//           <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//             {creating ? <Spinner /> : 'Create Voice'}
//           </button>
//         </form>
//       </section>

//       <div className='flex flex-row justify-between'>
//         <section className="mb-8 max-w-[50vw] ">
//           <h2 className="text-xl font-semibold mb-2">Available Voices</h2>
//           <ul className="flex flex-wrap gap-4 ">
//             {voices.map(v => (
//               <li key={v.id} className="flex flex-row gap-2 items-start bg-slate-500 p-2 rounded-md">
//                 <button onClick={() => fetchVoiceDetails(v.id)} className="text-blue-500 hover:underline">
//                   {v.name} ({v.state})
//                 </button>
//                 <button onClick={() => handleDelete(v.id)} disabled={deletingId === v.id} className="text-red-500 hover:underline">
//                   {deletingId === v.id ? <Spinner /> : 'Delete'}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </section>

//         {selectedVoice && (
//           <section className="p-4 border rounded-lg shadow-sm h-fit bg-black min-w-[30vw]">
//             <div className="flex justify-between items-center mb-2">
//               <h2 className="text-xl font-semibold">Voice Details</h2>
//               <button onClick={() => setEditMode(!editMode)} className="text-green-500 hover:underline">
//                 {editMode ? 'Cancel' : 'Edit'}
//               </button>
//             </div>
//             {editMode ? (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block mb-1">Name</label>
//                   <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" />
//                 </div>
//                 <div>
//                   <label className="block mb-1">Type</label>
//                   <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border rounded">
//                     <option value="instant">Instant</option>
//                     <option value="professional">Professional</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block mb-1">Gender</label>
//                   <input name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2 border rounded" />
//                 </div>
//                 <div>
//                   <label className="block mb-1">Description</label>
//                   <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border rounded" />
//                 </div>
//                 <button onClick={handleUpdate} disabled={updating} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
//                   {updating ? <Spinner /> : 'Save Changes'}
//                 </button>
//               </div>
//             ) : (
//               <div>
//                 <p><strong>ID:</strong> {selectedVoice.id}</p>
//                 <p><strong>Name:</strong> {selectedVoice.name}</p>
//                 <p><strong>Owner:</strong> {selectedVoice.owner}</p>
//                 <p><strong>State:</strong> {selectedVoice.state}</p>
//                 <p><strong>Type:</strong> {selectedVoice.type}</p>
//                 <p><strong>Gender:</strong> {selectedVoice.gender}</p>
//                 <p><strong>Description:</strong> {selectedVoice.description}</p>
//                 {selectedVoice.preview_url && (
//                   <audio controls src={selectedVoice.preview_url} className="mt-2" />
//                 )}
//               </div>
//             )}
//           </section>
//         )}
//       </div>
//     </div>
//   );
// }

// export default LongShot;
"use client"

import React, { useState, useEffect } from "react"
import { Mic, Plus, Edit3, Trash2, Save, X, Upload, User, Settings, Volume2 } from "lucide-react"
import axios from "axios"
import './App.css'
import PaginatedVoiceList from "./components/PaginatedVoiceList"

function Spinner() {
    return (
        <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="ml-2 text-sm">Loading...</span>
        </div>
    )
}



function LongShot() {
    const [voices, setVoices] = useState([])
    const [selectedVoice, setSelectedVoice] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        type: "instant",
        enhance: false,
        gender: "",
        description: "",
        files: [],
    })
    const [creating, setCreating] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        fetchVoices()
    }, [])

    const fetchVoices = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/lmnt/voices")
            setVoices(res.data)
        } catch (err) {
            console.error("Error fetching voices", err)
        }
    }

    const fetchVoiceDetails = async (id) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/lmnt/voices/${id}`)
            setSelectedVoice(res.data)
            setFormData({
                name: res.data.name,
                type: res.data.type,
                enhance: res.data.enhance,
                gender: res.data.gender,
                description: res.data.description,
                files: [],
            })
            setEditMode(false)
        } catch (err) {
            console.error("Error fetching voice details", err)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, files: Array.from(e.target.files) }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const payload = new FormData()
        payload.append(
            "metadata",
            JSON.stringify({
                name: formData.name,
                type: formData.type,
                enhance: formData.enhance,
                gender: formData.gender,
                description: formData.description,
            }),
        )
        formData.files.forEach((file) => payload.append("audioFiles", file))

        setCreating(true)
        try {
            const res = await axios.post("http://localhost:8080/api/lmnt/voices", payload)
            fetchVoices()
            setSelectedVoice(res.data.voiceData)
            // Reset form
            setFormData({
                name: "",
                type: "instant",
                enhance: false,
                gender: "",
                description: "",
                files: [],
            })
        } catch (err) {
            console.error("Creation error", err)
        } finally {
            setCreating(false)
        }
    }

    const handleUpdate = async () => {
        if (!selectedVoice) return
        setUpdating(true)
        try {
            const metadata = {
                name: formData.name,
                type: formData.type,
                enhance: formData.enhance,
                gender: formData.gender,
                description: formData.description,
            }
            await axios.put(`http://localhost:8080/api/lmnt/voices/${selectedVoice.id}`, metadata)
            fetchVoiceDetails(selectedVoice.id)
            fetchVoices()
            setEditMode(false)
        } catch (err) {
            console.error("Update error", err)
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this voice?")) return
        setDeletingId(id)
        try {
            await axios.delete(`http://localhost:8080/api/lmnt/voices/${id}`)
            setSelectedVoice((prev) => (prev?.id === id ? null : prev))
            fetchVoices()
        } catch (err) {
            console.error("Delete error", err)
        } finally {
            setDeletingId(null)
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            type: "instant",
            enhance: false,
            gender: "",
            description: "",
            files: [],
        })
    }

    return (
        <div className="min-h-screen text-black w-[99vw] bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container ml-46 px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Mic className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800">Voice Bot Agent Manager</h1>
                    </div>
                    <p className="text-slate-600">Create, manage, and configure AI voice agents for your applications</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Create Voice Form */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-white" />
                                    <h2 className="text-xl font-semibold text-white">Create New Voice Agent</h2>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Agent Name *</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Enter agent name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                                        <input
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="e.g., Male, Female, Neutral"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Voice Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="instant">Instant</option>
                                            <option value="professional">Professional</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center pt-8">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="enhance"
                                                checked={formData.enhance}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700">Enable Voice Enhancement</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Describe the voice characteristics and intended use..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Voice Samples</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                        <input
                                            type="file"
                                            multiple
                                            accept="audio/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <span className="text-sm text-slate-600">Click to upload audio files or drag and drop</span>
                                            <p className="text-xs text-slate-500 mt-1">Supports MP3, WAV, M4A files</p>
                                        </label>
                                        {formData.files.length > 0 && (
                                            <div className="mt-3 text-sm text-blue-600">{formData.files.length} file(s) selected</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {creating ? (
                                            <Spinner />
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Plus className="w-4 h-4" />
                                                Create Voice Agent
                                            </div>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Voice List */}
                       <div className="mt-8">
                            <PaginatedVoiceList
                                voices={voices}
                                fetchVoiceDetails={fetchVoiceDetails}
                                handleDelete={handleDelete}
                                deletingId={deletingId}
                            />
                        </div>
                    </div>

                    {/* Voice Details Panel */}
                    <div className="xl:col-span-1">
                        {selectedVoice ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
                                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-white" />
                                            <h2 className="text-xl font-semibold text-white">Voice Details</h2>
                                        </div>
                                        <button
                                            onClick={() => setEditMode(!editMode)}
                                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            {editMode ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {editMode ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                                <input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="instant">Instant</option>
                                                    <option value="professional">Professional</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                                                <input
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                />
                                            </div>
                                            <button
                                                onClick={handleUpdate}
                                                disabled={updating}
                                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                            >
                                                {updating ? (
                                                    <Spinner />
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Save className="w-4 h-4" />
                                                        Save Changes
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-500">ID</span>
                                                    <p className="font-mono text-xs text-slate-700 break-all">{selectedVoice.id}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Owner</span>
                                                    <p className="text-slate-700">{selectedVoice.owner}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">State</span>
                                                    <p
                                                        className={`font-medium ${selectedVoice.state === "ready" ? "text-green-600" : "text-yellow-600"
                                                            }`}
                                                    >
                                                        {selectedVoice.state}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Type</span>
                                                    <p className="text-slate-700 capitalize">{selectedVoice.type}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-slate-500 text-sm">Name</span>
                                                <p className="text-lg font-medium text-slate-800">{selectedVoice.name}</p>
                                            </div>

                                            {selectedVoice.gender && (
                                                <div>
                                                    <span className="text-slate-500 text-sm">Gender</span>
                                                    <p className="text-slate-700">{selectedVoice.gender}</p>
                                                </div>
                                            )}

                                            {selectedVoice.description && (
                                                <div>
                                                    <span className="text-slate-500 text-sm">Description</span>
                                                    <p className="text-slate-700">{selectedVoice.description}</p>
                                                </div>
                                            )}

                                            {selectedVoice.preview_url && (
                                                <div>
                                                    <span className="text-slate-500 text-sm">Preview</span>
                                                    <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                                                        <audio
                                                            controls
                                                            src={selectedVoice.preview_url}
                                                            className="w-full"
                                                            style={{ height: "40px" }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                                <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-700 mb-2">No Voice Selected</h3>
                                <p className="text-slate-500">Select a voice agent from the list to view and edit its details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LongShot
