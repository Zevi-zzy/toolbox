import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(to bottom right, #2563eb, #4338ca)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        {/* Box Icon (simplified as a cube-like shape or just a 'T') */}
        <div
          style={{
            width: 16,
            height: 16,
            border: '2px solid white',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 6, height: 6, background: 'white', borderRadius: '1px' }} />
        </div>
        
        {/* Sparkle badge */}
        <div
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 10,
            height: 10,
            background: '#fbbf24',
            borderRadius: '3px',
            border: '1.5px solid white',
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
