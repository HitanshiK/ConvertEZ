import React, { useState } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const SplitPDF = () => {
  const [message, setMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('startPage', startPage);
    formData.append('endPage', endPage);

    try {
      setUploading(true);
      setUploadProgress(0);
      const response = await axios.post('http://localhost:5000/api/pdf/split', formData, {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      setDownloadUrl(response.data.downloadUrl);
      setMessage('File split successfully! Click the button to download.');
    } catch (error) {
      setMessage('Error splitting file');
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'split.pdf'); // Optional: Suggest a default filename
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex justify-center items-center mt-10 ">
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg">
        <h2 className="mb-4 mt-8 text-3xl font-semibold">Split PDF Document</h2>
        <input
          type="file"
          onChange={onFileChange}
          className="hidden"
          id="fileInput"
        />
        <div className="flex mb-4">
          <input
            type="number"
            value={startPage}
            onChange={(e) => setStartPage(e.target.value)}
            placeholder="Start Page"
            className="mr-2 p-2 border rounded"
          />
          <input
            type="number"
            value={endPage}
            onChange={(e) => setEndPage(e.target.value)}
            placeholder="End Page"
            className="p-2 border rounded"
          />
        </div>
        <label htmlFor="fileInput" className="bg-rose-500 text-2xl text-white py-4 px-8 rounded mt-4 cursor-pointer">
          Upload and Split
        </label>
        {uploading && (
          <div className="mt-4 w-24 h-24">
            <CircularProgressbar
              value={uploadProgress}
              text={`${uploadProgress}%`}
              styles={buildStyles({
                textSize: '16px',
                fontWeight: 'bold',
                pathColor: `rgba(62, 152, 199, ${uploadProgress / 100})`,
                textColor: '#f88',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
              })}
            />
          </div>
        )}
        <p className="mt-4">{message}</p>
        {downloadUrl && (
          <button
            onClick={downloadFile}
            className="bg-blue-500 text-white py-4 px-8 rounded mt-4 cursor-pointer"
          >
            Download Split PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default SplitPDF;
