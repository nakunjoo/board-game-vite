import { useState, useRef, useEffect, useCallback } from "react";

export interface VoiceParticipant {
  playerId: string;
  nickname: string;
  isSpeaking?: boolean;
}

type SendFn = (event: string, data: unknown) => void;
type SubscribeFn = (handler: (event: string, data: unknown) => void) => () => void;

const STUN_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const SPEAKING_THRESHOLD = 15;

export function useVoice({
  send,
  subscribe,
  roomName,
  playerId,
}: {
  send: SendFn;
  subscribe: SubscribeFn;
  roomName: string;
  playerId: string;
}) {
  const [voiceParticipants, setVoiceParticipants] = useState<VoiceParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sendRef = useRef(send);
  sendRef.current = send;

  const createPeerConnection = useCallback(
    (targetPlayerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(STUN_CONFIG);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendRef.current("voiceSignal", {
            roomName,
            to: targetPlayerId,
            from: playerId,
            type: "ice",
            payload: e.candidate,
          });
        }
      };

      pc.ontrack = (e) => {
        const audio = new Audio();
        audio.srcObject = e.streams[0];
        audio.autoplay = true;
        audio.play().catch(() => {});
      };

      peerConnectionsRef.current.set(targetPlayerId, pc);
      return pc;
    },
    [roomName, playerId],
  );

  const setupSpeakingDetection = useCallback(
    (stream: MediaStream) => {
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let wasSpeaking = false;

      const check = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const speaking = avg > SPEAKING_THRESHOLD;

        if (speaking !== wasSpeaking) {
          wasSpeaking = speaking;
          sendRef.current("voiceSpeaking", { roomName, playerId, isSpeaking: speaking });
        }

        animationFrameRef.current = requestAnimationFrame(check);
      };

      animationFrameRef.current = requestAnimationFrame(check);
      audioContextRef.current = audioCtx;
    },
    [roomName, playerId],
  );

  useEffect(() => {
    const unsubscribe = subscribe(async (event, data: unknown) => {
      const d = data as Record<string, unknown>;

      if (event === "voiceJoined") {
        const existing = (d.existingParticipants as VoiceParticipant[]) ?? [];
        for (const participant of existing) {
          if (participant.playerId === playerId) continue;
          const pc = createPeerConnection(participant.playerId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendRef.current("voiceSignal", {
            roomName,
            to: participant.playerId,
            from: playerId,
            type: "offer",
            payload: offer,
          });
        }
      }

      if (event === "voiceParticipants") {
        if (d.roomName === roomName) {
          setVoiceParticipants((d.participants as VoiceParticipant[]) ?? []);
        }
      }

      if (event === "voiceSpeaking") {
        if (d.roomName === roomName) {
          const { playerId: speakerId, isSpeaking } = d as {
            playerId: string;
            isSpeaking: boolean;
          };
          setVoiceParticipants((prev) =>
            prev.map((p) => (p.playerId === speakerId ? { ...p, isSpeaking } : p)),
          );
        }
      }

      if (event === "voiceSignal") {
        const { from, type, payload } = d as {
          from: string;
          type: string;
          payload: unknown;
        };

        if (type === "offer") {
          let pc = peerConnectionsRef.current.get(from);
          if (!pc) pc = createPeerConnection(from);
          await pc.setRemoteDescription(payload as RTCSessionDescriptionInit);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendRef.current("voiceSignal", {
            roomName,
            to: from,
            from: playerId,
            type: "answer",
            payload: answer,
          });
        } else if (type === "answer") {
          const pc = peerConnectionsRef.current.get(from);
          if (pc) await pc.setRemoteDescription(payload as RTCSessionDescriptionInit);
        } else if (type === "ice") {
          const pc = peerConnectionsRef.current.get(from);
          if (pc) {
            try {
              await pc.addIceCandidate(payload as RTCIceCandidateInit);
            } catch {}
          }
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName, playerId, createPeerConnection]);

  const connect = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setupSpeakingDetection(stream);
      sendRef.current("voiceJoin", { roomName, playerId });
      setIsConnected(true);
    } catch {
      alert("마이크 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.");
    }
  };

  const disconnect = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    audioContextRef.current?.close();
    audioContextRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    sendRef.current("voiceLeave", { roomName, playerId });
    setIsConnected(false);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      audioContextRef.current?.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
    };
  }, []);

  return {
    voiceParticipants,
    isConnected,
    isVoicePanelOpen,
    setIsVoicePanelOpen,
    connect,
    disconnect,
  };
}
