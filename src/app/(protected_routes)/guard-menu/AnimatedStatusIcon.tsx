'use client';
import { Player } from '@lottiefiles/react-lottie-player';

export default function AnimatedStatusIcon({ type }: { type: any }) {
  const icons: Record<string, string> = {
    approved: 'https://img.icons8.com/color/48/ok--v1.png',
    denied: 'https://img.icons8.com/fluency/48/cancel.png',
    gate_delivery: 'https://img.icons8.com/external-sbts2018-flat-sbts2018/58/external-wait-lean-thinking-sbts2018-flat-sbts2018.png',
    lobby_delivery: 'https://img.icons8.com/arcade/64/waiting-room.png',
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
