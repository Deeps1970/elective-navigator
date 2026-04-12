export default function ParticlesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Subtle gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(216 33% 97%) 0%, hsl(210 40% 94%) 50%, hsl(210 30% 96%) 100%)',
        }}
      />
      {/* Decorative circles */}
      <div 
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, hsl(210 70% 45%), transparent 70%)' }}
      />
      <div 
        className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(199 70% 48%), transparent 70%)' }}
      />
    </div>
  );
}
