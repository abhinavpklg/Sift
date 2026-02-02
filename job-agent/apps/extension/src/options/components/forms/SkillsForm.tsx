/**
 * SkillsForm - Skills, languages, and certifications
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Skills, LanguageProficiency } from '../../../shared/types/profile';

interface SkillsFormProps {
  data: Skills;
  onChange: (data: Skills) => void;
}

export function SkillsForm({ data, onChange }: SkillsFormProps) {
  const [technicalInput, setTechnicalInput] = useState('');
  const [softInput, setSoftInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [langInput, setLangInput] = useState('');
  const [langProf, setLangProf] = useState<LanguageProficiency['proficiency']>('fluent');

  const addSkill = (type: 'technical' | 'soft' | 'certifications', value: string, setter: (v: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !data[type].includes(trimmed)) {
      onChange({ ...data, [type]: [...data[type], trimmed] });
      setter('');
    }
  };

  const removeSkill = (type: 'technical' | 'soft' | 'certifications', index: number) => {
    const updated = [...data[type]];
    updated.splice(index, 1);
    onChange({ ...data, [type]: updated });
  };

  const addLanguage = () => {
    const trimmed = langInput.trim();
    if (trimmed && !data.languages.some(l => l.language.toLowerCase() === trimmed.toLowerCase())) {
      onChange({
        ...data,
        languages: [...data.languages, { language: trimmed, proficiency: langProf }],
      });
      setLangInput('');
    }
  };

  const removeLanguage = (index: number) => {
    const updated = [...data.languages];
    updated.splice(index, 1);
    onChange({ ...data, languages: updated });
  };

  const SkillSection = ({
    title,
    description,
    skills,
    input,
    setInput,
    type,
    placeholder,
    tagColor,
  }: {
    title: string;
    description: string;
    skills: string[];
    input: string;
    setInput: (v: string) => void;
    type: 'technical' | 'soft' | 'certifications';
    placeholder: string;
    tagColor: string;
  }) => (
    <section>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${tagColor}`}
          >
            {skill}
            <button onClick={() => removeSkill(type, index)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <span className="text-sm text-gray-400 italic">No {title.toLowerCase()} added</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(type, input, setInput))}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder={placeholder}
        />
        <button
          onClick={() => addSkill(type, input, setInput)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </section>
  );

  return (
    <div className="space-y-8">
      <SkillSection
        title="Technical Skills"
        description="Programming languages, frameworks, tools, etc."
        skills={data.technical}
        input={technicalInput}
        setInput={setTechnicalInput}
        type="technical"
        placeholder="e.g., JavaScript, React, Python"
        tagColor="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      />

      <SkillSection
        title="Soft Skills"
        description="Communication, leadership, teamwork, etc."
        skills={data.soft}
        input={softInput}
        setInput={setSoftInput}
        type="soft"
        placeholder="e.g., Communication, Leadership"
        tagColor="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      />

      <SkillSection
        title="Certifications"
        description="Professional certifications and licenses"
        skills={data.certifications}
        input={certInput}
        setInput={setCertInput}
        type="certifications"
        placeholder="e.g., AWS Certified Developer"
        tagColor="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      />

      {/* Languages */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Languages</h3>
        <p className="text-sm text-gray-500 mb-3">Languages you speak</p>
        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
          {data.languages.map((lang, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-sm"
            >
              <span className="font-medium">{lang.language}</span>
              <span className="text-orange-500 dark:text-orange-500">({lang.proficiency})</span>
              <button onClick={() => removeLanguage(index)} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {data.languages.length === 0 && (
            <span className="text-sm text-gray-400 italic">No languages added</span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={langInput}
            onChange={(e) => setLangInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., English, Spanish"
          />
          <select
            value={langProf}
            onChange={(e) => setLangProf(e.target.value as LanguageProficiency['proficiency'])}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="native">Native</option>
            <option value="fluent">Fluent</option>
            <option value="conversational">Conversational</option>
            <option value="basic">Basic</option>
          </select>
          <button
            onClick={addLanguage}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </section>
    </div>
  );
}

export default SkillsForm;
