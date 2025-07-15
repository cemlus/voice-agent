// This component assumes the voices list is passed as a prop
// Pagination state is local and does not interfere with external logic

import React, { useState } from 'react';
import { Volume2, Mic, Trash2 } from 'lucide-react';

export default function PaginatedVoiceList({ voices, fetchVoiceDetails, handleDelete, deletingId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const voicesPerPage = 6;

  const indexOfLast = currentPage * voicesPerPage;
  const indexOfFirst = indexOfLast - voicesPerPage;
  const currentVoices = voices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(voices.length / voicesPerPage);

  return (
    <div className="mt-8 p-5 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto max-h-[60vh] w-[60vw] m-auto ">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-800">Available Voice Agents</h2>
          <span className="ml-auto bg-slate-200 text-slate-700 px-2 py-1 rounded-full text-sm font-medium">
            {voices.length} agents
          </span>
        </div>
      </div>

      <div className="p-6">
        {voices.length === 0 ? (
          <div className="text-center py-8">
            <Mic className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No voice agents created yet</p>
            <p className="text-sm text-slate-400">Create your first voice agent above</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentVoices.map((voice) => (
                <div
                  key={voice.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => fetchVoiceDetails(voice.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 mb-1">{voice.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            voice.state === "ready"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {voice.state}
                        </span>
                        <span className="text-xs text-slate-500">{voice.type}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(voice.id);
                      }}
                      disabled={deletingId === voice.id}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deletingId === voice.id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-1 rounded border text-sm ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
