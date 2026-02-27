'use client';

import { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  SignalIcon,
  BellAlertIcon,
  DocumentTextIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { MicrophoneIcon as MicrophoneSolidIcon } from '@heroicons/react/24/solid';

export default function EmergencyCommsPage() {
  const [activeChannel, setActiveChannel] = useState('dispatch');
  const [message, setMessage] = useState('');
  const [isPTTActive, setIsPTTActive] = useState(false);

  const channels = [
    { id: 'dispatch', name: 'Main Dispatch', type: 'radio', users: 12, status: 'active', priority: 'high' },
    { id: 'unit-1', name: 'AMB-001 Direct', type: 'direct', users: 2, status: 'active', priority: 'normal' },
    { id: 'unit-3', name: 'AMB-003 Direct', type: 'direct', users: 3, status: 'active', priority: 'high' },
    { id: 'hospital', name: 'City General ER', type: 'hospital', users: 5, status: 'active', priority: 'normal' },
    { id: 'command', name: 'Command Center', type: 'command', users: 8, status: 'active', priority: 'critical' },
    { id: 'fire', name: 'Fire Department', type: 'interagency', users: 15, status: 'standby', priority: 'normal' }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Dispatch',
      content: 'AMB-001, respond to cardiac emergency at 42nd Street & Broadway.',
      time: '10:30 AM',
      type: 'alert',
      read: true
    },
    {
      id: 2,
      sender: 'AMB-001',
      content: 'Copy dispatch, en route. ETA 5 minutes.',
      time: '10:31 AM',
      type: 'response',
      read: true
    },
    {
      id: 3,
      sender: 'City General ER',
      content: 'Trauma bay 2 ready for incoming cardiac patient.',
      time: '10:32 AM',
      type: 'info',
      read: true
    },
    {
      id: 4,
      sender: 'AMB-001',
      content: 'On scene. Patient is 62-year-old male, presenting with chest pain and shortness of breath. Starting assessment.',
      time: '10:35 AM',
      type: 'update',
      read: true
    },
    {
      id: 5,
      sender: 'Dispatch',
      content: 'Copy AMB-001. Medical Control Dr. Johnson is standing by.',
      time: '10:36 AM',
      type: 'response',
      read: true
    },
    {
      id: 6,
      sender: 'AMB-001',
      content: 'Patient stable. Initiating transport to City General. BP 140/90, HR 98, SpO2 94%.',
      time: '10:42 AM',
      type: 'critical',
      read: false
    }
  ];

  const activeUnits = [
    { id: 'AMB-001', name: 'Unit 1', status: 'responding', signal: 'strong' },
    { id: 'AMB-003', name: 'Unit 3', status: 'at-scene', signal: 'strong' },
    { id: 'AMB-004', name: 'Unit 4', status: 'transporting', signal: 'moderate' },
    { id: 'CMD-01', name: 'Command', status: 'monitoring', signal: 'strong' }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const activeChannelData = channels.find(c => c.id === activeChannel);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen">
        {/* Sidebar - Channels */}
        <div className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Communications</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Emergency Radio Network</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Active Channels</p>
              <div className="space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      activeChannel === channel.id
                        ? 'bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      channel.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                      channel.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      {channel.type === 'radio' && <SignalIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                      {channel.type === 'direct' && <PhoneIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                      {channel.type === 'hospital' && <DocumentTextIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                      {channel.type === 'command' && <BellAlertIcon className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      {channel.type === 'interagency' && <UserGroupIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium truncate ${
                          activeChannel === channel.id
                            ? 'text-cyan-700 dark:text-cyan-400'
                            : 'text-slate-900 dark:text-white'
                        }`}>{channel.name}</p>
                        {channel.priority === 'critical' && (
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {channel.users} users • {channel.status}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Active Units</p>
              <div className="space-y-2">
                {activeUnits.map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        unit.status === 'responding' ? 'bg-yellow-500' :
                        unit.status === 'at-scene' ? 'bg-orange-500' :
                        unit.status === 'transporting' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{unit.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((bar) => (
                        <div
                          key={bar}
                          className={`w-1 rounded-full ${
                            unit.signal === 'strong' || (unit.signal === 'moderate' && bar <= 2)
                              ? 'bg-green-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                          style={{ height: `${bar * 4 + 4}px` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Channel Header */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  activeChannelData?.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                  activeChannelData?.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-cyan-100 dark:bg-cyan-900/30'
                }`}>
                  <SignalIcon className={`w-6 h-6 ${
                    activeChannelData?.priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                    activeChannelData?.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                    'text-cyan-600 dark:text-cyan-400'
                  }`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{activeChannelData?.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {activeChannelData?.users} participants • Channel active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <PhoneIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <VideoCameraIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <EllipsisVerticalIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'Dispatch' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-md rounded-xl p-4 ${
                  msg.type === 'alert' ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800' :
                  msg.type === 'critical' ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800' :
                  msg.sender === 'Dispatch' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-cyan-100 dark:bg-cyan-900/30'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${
                      msg.type === 'alert' ? 'text-red-700 dark:text-red-400' :
                      msg.type === 'critical' ? 'text-orange-700 dark:text-orange-400' :
                      'text-slate-700 dark:text-slate-300'
                    }`}>{msg.sender}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-4">{msg.time}</span>
                  </div>
                  <p className={`text-sm ${
                    msg.type === 'alert' ? 'text-red-800 dark:text-red-300' :
                    msg.type === 'critical' ? 'text-orange-800 dark:text-orange-300' :
                    'text-slate-800 dark:text-slate-200'
                  }`}>{msg.content}</p>
                  <div className="flex items-center justify-end mt-2">
                    {msg.read && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
            {/* PTT Button */}
            <div className="flex justify-center mb-4">
              <button
                onMouseDown={() => setIsPTTActive(true)}
                onMouseUp={() => setIsPTTActive(false)}
                onMouseLeave={() => setIsPTTActive(false)}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isPTTActive
                    ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/50'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                {isPTTActive ? (
                  <MicrophoneSolidIcon className="w-8 h-8 text-white animate-pulse" />
                ) : (
                  <MicrophoneIcon className="w-8 h-8 text-white" />
                )}
              </button>
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
              {isPTTActive ? 'Transmitting...' : 'Hold to talk'}
            </p>

            {/* Text Input */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="p-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4 hidden lg:block">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
              <BellAlertIcon className="w-5 h-5" />
              <span className="font-medium">Emergency Alert</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <MapPinIcon className="w-5 h-5" />
              <span className="font-medium">Share Location</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <DocumentTextIcon className="w-5 h-5" />
              <span className="font-medium">Send Report</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <UserGroupIcon className="w-5 h-5" />
              <span className="font-medium">Request Backup</span>
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Channel Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Frequency</span>
                <span className="text-slate-900 dark:text-white font-mono">155.340 MHz</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Encryption</span>
                <span className="text-green-600 dark:text-green-400">AES-256</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Latency</span>
                <span className="text-slate-900 dark:text-white">12ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
