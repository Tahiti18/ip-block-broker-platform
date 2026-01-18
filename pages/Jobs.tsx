
import React, { useEffect, useState } from 'react';
import { api, SystemHealth } from '../services/api';
import { JobRun, JobType, JobStatus } from '../types';
import { Play, RotateCw, AlertTriangle, CheckCircle2, Terminal as TerminalIcon, Cpu } from 'lucide-react';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobRun[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = () => {
      Promise.all([api.getJobs(), api.getHealth()])
        .then(([j, h]) => {
          setJobs(j);
          setHealth(h);
          setLoading(false);
        });
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const runJob = async (type: JobType) => {
    await api.startJob(type);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Ingestion & Engine Jobs</h1>
          <p className="text-slate-500">Manage data pipelines, scoring runs, and background workers.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(JobType).map((type) => (
          <div key={type} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Cpu className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="font-bold text-slate-800">{type}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Execution of legal sourcing logic. Data persisted to IPv4 OS Postgres cluster.
            </p>
            <button 
              onClick={() => runJob(type)}
              disabled={jobs.some(j => j.status === JobStatus.RUNNING && j.type === type)}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Job</span>
            </button>
          </div>
        ))}
      </div>

      {/* Recent Job Runs */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <TerminalIcon className="w-5 h-5" />
            <h3 className="font-bold">Execution History</h3>
          </div>
          <div className="flex items-center space-x-4">
             {health && (
               <div className="flex items-center text-xs text-white/50">
                 <div className={`w-2 h-2 rounded-full mr-2 ${health.worker === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 Worker Node: {health.worker.toUpperCase()}
               </div>
             )}
          </div>
        </div>
        
        <div className="p-0">
          {jobs.length === 0 ? (
            <div className="p-20 text-center text-white/30 italic">No job records in database.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {job.status === JobStatus.RUNNING ? (
                        <RotateCw className="w-5 h-5 text-blue-400 animate-spin" />
                      ) : job.status === JobStatus.SUCCESS ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold">{job.type}</span>
                          <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-mono">#{job.id}</span>
                        </div>
                        <p className="text-xs text-white/40 mt-1">Started: {new Date(job.startedAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex-1 lg:max-w-xs px-4">
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${job.status === JobStatus.FAILED ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${job.progress}%` }}
                          ></div>
                       </div>
                       <p className="text-[10px] text-white/50 mt-1 text-right font-mono">{job.status.toUpperCase()} ({job.progress}%)</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
