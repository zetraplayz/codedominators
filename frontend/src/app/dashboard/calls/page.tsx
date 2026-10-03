"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/context/session";
import { ClayButton } from "@/components/ui/ClayButton";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Users, MonitorUp } from "lucide-react";

export default function CallsPage() {
  const { user } = useSession();
  const [roomId, setRoomId] = useState("");
  const [inCall, setInCall] = useState(false);
  
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // Fallback to Google STUN servers for WebRTC, can be overridden by TURN
  const rtcConfigRef = useRef<RTCConfiguration>({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setInCall(false);
    setPeers([]);
  };

  useEffect(() => {
    return cleanupCall;
  }, []);

  const initWebRTC = async (clientId: string, room: string) => {
    const pc = new RTCPeerConnection(rtcConfigRef.current);
    pcRef.current = pc;

    // Add local stream tracks to PC
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: "ice_candidate",
          payload: event.candidate,
          target: peers.length > 0 ? peers[0] : undefined // Simplification for 1:1
        }));
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  };

  const joinCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !user) return;
    
    try {
      // Fetch TURN credentials
      try {
        const turnRes = await fetch("/api/calls/turn-credentials", { credentials: "include" });
        if (turnRes.ok) {
          const turnData = await turnRes.json();
          if (turnData.url && turnData.username && turnData.password) {
            rtcConfigRef.current = {
              iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                {
                  urls: turnData.url,
                  username: turnData.username,
                  credential: turnData.password
                }
              ]
            };
          }
        }
      } catch (e) {
        console.error("Failed to fetch TURN credentials", e);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      const clientId = user.id + "-" + Math.random().toString(36).substr(2, 9);
      
      // We assume backend is running on same origin but port 8000 (standard for local FastAPI)
      // In prod, this would map to the correct WS URL.
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = process.env.NEXT_PUBLIC_API_URL 
        ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws') 
        : `${wsProtocol}//${window.location.hostname}:8000/api/calls`;
        
      const ws = new WebSocket(`${wsUrl}/ws/${roomId}/${clientId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setInCall(true);
        initWebRTC(clientId, roomId);
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        const pc = pcRef.current;
        if (!pc) return;

        switch (msg.type) {
          case "user_joined":
            setPeers(prev => [...prev, msg.client_id]);
            // I am the caller, send offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({
              type: "offer",
              target: msg.client_id,
              payload: offer
            }));
            break;
            
          case "user_left":
            setPeers(prev => prev.filter(p => p !== msg.client_id));
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            break;
            
          case "offer":
            setPeers(prev => prev.includes(msg.sender) ? prev : [...prev, msg.sender]);
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({
              type: "answer",
              target: msg.sender,
              payload: answer
            }));
            break;
            
          case "answer":
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            break;
            
          case "ice_candidate":
            await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
            break;
        }
      };

    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Could not access camera/microphone. Please allow permissions.");
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!pcRef.current) return;
    
    try {
      if (!screenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track in peer connection
        const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
        
        // Update local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Handle stream stop from browser UI
        screenTrack.onended = () => {
          stopScreenShare();
        };
        
        setScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Error sharing screen", err);
    }
  };

  const stopScreenShare = async () => {
    if (!pcRef.current || !localStreamRef.current) return;
    
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
    if (sender && videoTrack) {
      await sender.replaceTrack(videoTrack);
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    setScreenSharing(false);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 max-w-5xl mx-auto gap-6 w-full">
      <div>
        <h1 className="text-4xl font-extrabold text-[var(--color-base-text)]">Calls & Meetings</h1>
        <p className="opacity-70 mt-2 font-medium text-[var(--color-base-text)]">
          Join high-quality WebRTC video calls for secure institutional communication.
        </p>
      </div>

      {!inCall ? (
        <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card max-w-xl flex flex-col gap-6 mt-8">
          <div className="w-16 h-16 bg-[var(--color-base-mint)] shadow-clay-btn rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="text-[var(--color-base-text)]" size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--color-base-text)] text-center">Join a Meeting</h2>
          
          <form onSubmit={joinCall} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-[var(--color-base-text)] mb-2 uppercase tracking-wider opacity-70">
                Meeting ID / Room Name
              </label>
              <input
                type="text"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. staff-sync-weekly"
                className="w-full p-4 rounded-xl font-bold bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)] outline-none"
              />
            </div>
            
            <ClayButton type="submit" variant="primary" className="w-full py-4 text-lg mt-4">
              Join Call
            </ClayButton>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">Room: {roomId}</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-700 font-bold rounded-lg text-sm">
                Connected
              </span>
            </div>
            <div className="flex items-center gap-2 font-medium opacity-70">
              <Users size={16} />
              <span>{peers.length + 1} participant(s)</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
            {/* Local Video */}
            <div className="relative rounded-3xl overflow-hidden bg-black shadow-clay-card">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${videoMuted ? 'opacity-0' : ''}`}
                style={{ transform: "scaleX(-1)" }} // Mirror local video
              />
              <div className="absolute inset-0 flex items-center justify-center text-white opacity-50 pointer-events-none">
                {videoMuted && <VideoOff size={48} />}
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-sm flex items-center gap-2">
                {user?.name} (You)
                {audioMuted && <MicOff size={14} className="text-red-400" />}
              </div>
            </div>
            
            {/* Remote Video */}
            <div className="relative rounded-3xl overflow-hidden bg-black shadow-clay-card flex items-center justify-center">
              {peers.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-white/50 gap-4">
                  <div className="w-20 h-20 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
                  <p className="font-bold">Waiting for others to join...</p>
                </div>
              ) : (
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              )}
              {peers.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-sm">
                  Participant ({peers[0].substring(0, 8)}...)
                </div>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-6 p-4 bg-[var(--color-base-bg)] shadow-clay-card rounded-full mx-auto mt-4">
            <button 
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                audioMuted ? 'bg-red-500 text-white shadow-clay-btn' : 'bg-[var(--color-base-mint)] text-[var(--color-base-text)] shadow-clay-btn'
              }`}
            >
              {audioMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button 
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                videoMuted ? 'bg-red-500 text-white shadow-clay-btn' : 'bg-[var(--color-base-mint)] text-[var(--color-base-text)] shadow-clay-btn'
              }`}
            >
              {videoMuted ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
            
            <button 
              onClick={toggleScreenShare}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                screenSharing ? 'bg-blue-500 text-white shadow-clay-btn' : 'bg-[var(--color-base-mint)] text-[var(--color-base-text)] shadow-clay-btn'
              }`}
              title="Share Screen"
            >
              <MonitorUp size={24} />
            </button>
            
            <button 
              onClick={cleanupCall}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500 text-white shadow-clay-btn ml-4"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
