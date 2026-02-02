/**
 * DocumentsForm - Resume and cover letter management
 */

import { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Download } from 'lucide-react';
import type { Documents } from '../../../shared/types/profile';

interface DocumentsFormProps {
  data: Documents;
  onChange: (data: Documents) => void;
}

export function DocumentsForm({ data, onChange }: DocumentsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.includes('pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange({
        ...data,
        resumeDataUrl: dataUrl,
        resumeFileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const removeResume = () => {
    onChange({
      ...data,
      resumeDataUrl: undefined,
      resumeFileName: undefined,
    });
  };

  const downloadResume = () => {
    if (!data.resumeDataUrl || !data.resumeFileName) return;
    const link = document.createElement('a');
    link.href = data.resumeDataUrl;
    link.download = data.resumeFileName;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Resume Upload */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Resume</h3>
        <p className="text-sm text-gray-500 mb-4">Upload your resume (PDF, max 5MB)</p>

        {data.resumeDataUrl ? (
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{data.resumeFileName}</p>
                <p className="text-sm text-gray-500">Resume uploaded</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadResume}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={removeResume}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                title="Remove"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              Drag and drop your resume here, or click to browse
            </p>
            <p className="text-sm text-gray-500">PDF only, max 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        )}
      </section>

      {/* Cover Letter Template */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Cover Letter Template</h3>
        <p className="text-sm text-gray-500 mb-4">
          Default cover letter template (use {'{{company}}'}, {'{{position}}'} as placeholders)
        </p>
        <textarea
          value={data.coverLetterTemplate || ''}
          onChange={(e) => onChange({ ...data, coverLetterTemplate: e.target.value })}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
          placeholder={`Dear Hiring Manager,

I am excited to apply for the {{position}} role at {{company}}...

Best regards,
[Your Name]`}
        />
      </section>
    </div>
  );
}

export default DocumentsForm;
