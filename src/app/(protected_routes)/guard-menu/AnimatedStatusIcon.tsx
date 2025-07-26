'use client';
import { Player } from '@lottiefiles/react-lottie-player';

export default function AnimatedStatusIcon({ type }: { type: any }) {
  const icons: Record<string, string> = {
    approved: 'https://img.icons8.com/color/48/ok--v1.png',
    denied: 'https://img.icons8.com/fluency/48/cancel.png',
    wait_at_gate: 'https://lottie.host/yellow-door.json',
    wait_at_lobby: 'https://lottie.host/blue-door.json',
    pending: 'https://img.icons8.com/doodle/48/hourglass.png',
  };

  return (
    // <Player
    //   autoplay
    //   loop
    //   src={icons[type] || icons.pending}
    //   style={{ height: 24, width: 24 }}
    // />
    <img width="24" height="24" src={icons[type]} alt="good-quality"/>
  );
}
