

import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Card from '../shared/Card';

const ManagerAnnouncements: React.FC = () => {
    const { announcements, addAnnouncement, currentProperty } = useContext(AppContext);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            addAnnouncement({ title, content });
            setTitle('');
            setContent('');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Announcements</h1>
                <p className="text-slate-500">For {currentProperty?.name}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="New Announcement">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-slate-700">Content</label>
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={5}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-brand-secondary focus:border-brand-secondary"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-secondary"
                            >
                                Post Announcement
                            </button>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card title="Past Announcements">
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {announcements.map(ann => (
                                <div key={ann.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-semibold text-slate-800">{ann.title}</h4>
                                        <p className="text-xs text-slate-500">{new Date(ann.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">{ann.content}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ManagerAnnouncements;
