/**
 * WorkHistoryForm - Work experience section
 */

import { Plus, Trash2, Briefcase, X } from 'lucide-react';
import { useState } from 'react';
import type { WorkExperience } from '../../../shared/types/profile';

interface WorkHistoryFormProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

export function WorkHistoryForm({ data, onChange }: WorkHistoryFormProps) {
  const [techInput, setTechInput] = useState<{ [key: string]: string }>({});

  const addWork = () => {
    const newWork: WorkExperience = {
      id: `work-${Date.now()}`,
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      technologies: [],
    };
    onChange([...data, newWork]);
  };

  const updateWork = (index: number, updates: Partial<WorkExperience>) => {
    const updated = [...data];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeWork = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const addTech = (index: number) => {
    const tech = techInput[data[index].id]?.trim();
    if (tech && !data[index].technologies.includes(tech)) {
      updateWork(index, { technologies: [...data[index].technologies, tech] });
      setTechInput({ ...techInput, [data[index].id]: '' });
    }
  };

  const removeTech = (workIndex: number, techIndex: number) => {
    const techs = [...data[workIndex].technologies];
    techs.splice(techIndex, 1);
    updateWork(workIndex, { technologies: techs });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Work Experience</h3>
          <p className="text-sm text-gray-500">Add your professional experience</p>
        </div>
        <button
          onClick={addWork}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">No work experience added yet</p>
          <button
            onClick={addWork}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Add your first job
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((work, index) => (
            <div
              key={work.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {work.title ? `${work.title} at ${work.company}` : `Experience ${index + 1}`}
                </h4>
                <button
                  onClick={() => removeWork(index)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={work.company}
                    onChange={(e) => updateWork(index, { company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={work.title}
                    onChange={(e) => updateWork(index, { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={work.location}
                    onChange={(e) => updateWork(index, { location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="month"
                    value={work.startDate}
                    onChange={(e) => updateWork(index, { startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="month"
                    value={work.endDate}
                    onChange={(e) => updateWork(index, { endDate: e.target.value })}
                    disabled={work.current}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div className="col-span-2 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={work.current}
                      onChange={(e) => updateWork(index, { current: e.target.checked, endDate: '' })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">I currently work here</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={work.description}
                    onChange={(e) => updateWork(index, { description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Technologies Used
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {work.technologies.map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded text-sm"
                      >
                        {tech}
                        <button
                          onClick={() => removeTech(index, techIdx)}
                          className="hover:text-primary-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={techInput[work.id] || ''}
                      onChange={(e) => setTechInput({ ...techInput, [work.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech(index))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Add technology (press Enter)"
                    />
                    <button
                      onClick={() => addTech(index)}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkHistoryForm;
