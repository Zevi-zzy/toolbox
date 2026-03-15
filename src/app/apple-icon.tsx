import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 120,
          background: 'linear-gradient(to bottom right, #2563eb, #4338ca)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '40px',
          position: 'relative',
        }}
      >
        {/* Box Icon */}
        <div
          style={{
            width: 90,
            height: 90,
            border: '10px solid white',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 35, height: 35, background: 'white', borderRadius: '5px' }} />
        </div>
        
        {/* Sparkle badge */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 50,
            height: 50,
            background: '#fbbf24',
            borderRadius: '15px',
            border: '8px solid white',
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
