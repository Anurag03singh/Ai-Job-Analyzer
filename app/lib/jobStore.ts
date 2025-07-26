import { create } from "zustand";
import { usePuterStore } from "./puter";

interface JobStore {
    jobs: JobApplication[];
    isLoading: boolean;
    error: string | null;
    
    // Actions
    loadJobs: () => Promise<void>;
    addJob: (jobData: JobFormData) => Promise<void>;
    updateJob: (id: string, jobData: JobFormData) => Promise<void>;
    deleteJob: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useJobStore = create<JobStore>((set, get) => ({
    jobs: [],
    isLoading: false,
    error: null,

    loadJobs: async () => {
        set({ isLoading: true, error: null });
        
        try {
            const { kv } = usePuterStore.getState();
            const jobEntries = (await kv.list('job:*', true)) as KVItem[];
            
            const jobs = jobEntries?.map((entry) => 
                JSON.parse(entry.value) as JobApplication
            ) || [];
            
            // Sort by date applied (newest first)
            jobs.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
            
            set({ jobs, isLoading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to load jobs',
                isLoading: false 
            });
        }
    },

    addJob: async (jobData: JobFormData) => {
        set({ isLoading: true, error: null });
        
        try {
            const { kv } = usePuterStore.getState();
            const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();
            
            const newJob: JobApplication = {
                id,
                ...jobData,
                createdAt: now,
                updatedAt: now,
            };
            
            await kv.set(`job:${id}`, JSON.stringify(newJob));
            
            const currentJobs = get().jobs;
            const updatedJobs = [newJob, ...currentJobs];
            
            set({ jobs: updatedJobs, isLoading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to add job',
                isLoading: false 
            });
        }
    },

    updateJob: async (id: string, jobData: JobFormData) => {
        set({ isLoading: true, error: null });
        
        try {
            const { kv } = usePuterStore.getState();
            const currentJobs = get().jobs;
            const existingJob = currentJobs.find(job => job.id === id);
            
            if (!existingJob) {
                throw new Error('Job not found');
            }
            
            const updatedJob: JobApplication = {
                ...existingJob,
                ...jobData,
                updatedAt: new Date().toISOString(),
            };
            
            await kv.set(`job:${id}`, JSON.stringify(updatedJob));
            
            const updatedJobs = currentJobs.map(job => 
                job.id === id ? updatedJob : job
            );
            
            set({ jobs: updatedJobs, isLoading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to update job',
                isLoading: false 
            });
        }
    },

    deleteJob: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
            const { kv } = usePuterStore.getState();
            await kv.delete(`job:${id}`);
            
            const currentJobs = get().jobs;
            const updatedJobs = currentJobs.filter(job => job.id !== id);
            
            set({ jobs: updatedJobs, isLoading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to delete job',
                isLoading: false 
            });
        }
    },

    clearError: () => set({ error: null }),
}));